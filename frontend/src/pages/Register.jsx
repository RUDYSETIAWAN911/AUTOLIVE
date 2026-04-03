import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { ArrowLeft, UserPlus, Mail, Phone, Lock, Eye, EyeOff, Key, CheckCircle, AlertCircle, Shield, Crown, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [generatedCode, setGeneratedCode] = useState('')
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const checkEmailExists = async (email) => {
    const { data, error } = await supabase.from('users').select('subscription').eq('email', email).single()
    if (data) return data.subscription
    return null
  }

  const sendVerificationCode = async () => {
    if (!formData.email) { toast.error('Masukkan email terlebih dahulu'); return; }
    
    const existingSubscription = await checkEmailExists(formData.email)
    if (existingSubscription) {
      if (selectedPlan === 'free' && (existingSubscription === 'pro' || existingSubscription === 'premium')) {
        toast.error(t('upgrade_not_allowed'))
        return
      }
      if (existingSubscription === 'free' && selectedPlan !== 'free') {
        toast.info('Email ini sudah terdaftar sebagai FREE. Silakan upgrade melalui dashboard.')
        return
      }
      if (existingSubscription !== 'free') {
        toast.info('Email sudah terdaftar. Silakan login.')
        return
      }
    }

    setLoading(true)
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)
      localStorage.setItem(`verification_${formData.email}`, code)
      alert(`Kode verifikasi Anda: ${code}\n\n(Demo: Kode akan ditampilkan di sini. Di production, kode akan dikirim ke email Anda.)`)
      toast.success(`Kode verifikasi telah dikirim ke ${formData.email}`)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => { if (prev <= 1) { clearInterval(timer); return 0 } return prev - 1 })
      }, 1000)
    } catch (error) { toast.error('Gagal mengirim kode verifikasi') }
    finally { setLoading(false) }
  }

  const verifyCode = () => {
    const savedCode = localStorage.getItem(`verification_${formData.email}`)
    if (verificationCode === savedCode) { toast.success('Kode verifikasi benar!'); return true }
    else { toast.error(t('verification_failed')); return false }
  }

  const handleRegister = async () => {
    if (!formData.full_name || !formData.email || !formData.password) { toast.error('Semua field harus diisi'); return; }
    if (formData.password !== formData.confirm_password) { toast.error('Password tidak cocok'); return; }
    if (formData.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    if (!verifyCode()) return;

    const existingSubscription = await checkEmailExists(formData.email)
    if (existingSubscription) {
      if (selectedPlan === 'free' && (existingSubscription === 'pro' || existingSubscription === 'premium')) {
        toast.error(t('upgrade_not_allowed'))
        return
      }
      toast.error(t('email_exists'))
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: { data: { full_name: formData.full_name, phone: formData.phone } }
      })
      if (authError) throw authError

      if (authData.user) {
        const subscriptionExpiry = selectedPlan === 'free' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id, email: formData.email, full_name: formData.full_name, phone: formData.phone,
          role: 'user', subscription: selectedPlan, subscription_expiry: subscriptionExpiry
        })
        if (dbError) throw dbError

        localStorage.removeItem(`verification_${formData.email}`)
        toast.success('Registrasi berhasil! Silakan login.')
        if (selectedPlan === 'pro' || selectedPlan === 'premium') {
          localStorage.setItem('selected_plan', selectedPlan)
          navigate('/payment')
        } else { navigate('/login') }
      }
    } catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  const plans = [
    { id: 'free', name: 'Free Trial', price: '0', duration: '1 hari', features: ['Akses semua fitur', 'Masa aktif 1 hari'], icon: <User className="w-5 h-5" />, color: 'from-gray-500 to-gray-700' },
    { id: 'pro', name: 'Pro', price: '99.000', duration: 'per bulan', features: ['Akses semua fitur', 'Kecuali jadwal upload'], icon: <Star className="w-5 h-5 text-blue-500" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'premium', name: 'Premium', price: '199.000', duration: 'per bulan', features: ['Akses semua fitur lengkap', 'Prioritas dukungan'], icon: <Crown className="w-5 h-5 text-yellow-500" />, color: 'from-yellow-500 to-orange-500' }
  ]

  return (
    <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-end gap-3"><LanguageToggle /><ThemeToggle /></div>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate('/login')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary"><ArrowLeft className="w-4 h-4" /> {t('back') || 'Kembali'}</button>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('select_plan')}</h2>
            {plans.map((plan) => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? `border-primary bg-gradient-to-r ${plan.color} bg-opacity-10` : 'border-gray-200 dark:border-gray-800 hover:border-primary/50'}`}>
                <div className="flex justify-between items-center"><div><div className="flex items-center gap-2"><div className="p-1 rounded-lg bg-primary/10">{plan.icon}</div><h3 className="text-lg font-bold">{plan.name}</h3></div><p className="text-2xl font-bold text-primary">Rp {plan.price}</p><p className="text-xs text-gray-500">{plan.duration}</p></div>{selectedPlan === plan.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">✓</div>}</div>
                <ul className="mt-3 space-y-1">{plan.features.map((feature, i) => (<li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> {feature}</li>))}</ul>
              </div>
            ))}
          </div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border"><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('register')}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label><div className="relative"><UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white" placeholder={language === 'id' ? 'Nama lengkap' : 'Full name'} required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder="email@example.com" required /></div></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('verification_code')}</label><div className="flex gap-2"><div className="relative flex-1"><Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder={t('enter_code')} disabled={!codeSent} /></div><button type="button" onClick={sendVerificationCode} disabled={loading || countdown > 0} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 whitespace-nowrap">{countdown > 0 ? `${countdown}s` : t('send_code')}</button></div>{codeSent && <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t('code_sent')}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label><div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder="081234567890" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder={language === 'id' ? 'Minimal 6 karakter' : 'Minimum 6 characters'} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2">{showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password')}</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleChange} className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" placeholder={language === 'id' ? 'Ulangi password' : 'Repeat password'} required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2">{showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}</button></div></div>
              <button onClick={handleRegister} disabled={loading || !codeSent} className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">{loading ? (language === 'id' ? 'Memproses...' : 'Processing...') : (language === 'id' ? `Daftar ${selectedPlan === 'free' ? 'Gratis' : selectedPlan === 'pro' ? 'Pro Rp 99.000' : 'Premium Rp 199.000'}` : `Register ${selectedPlan === 'free' ? 'Free' : selectedPlan === 'pro' ? 'Pro Rp 99.000' : 'Premium Rp 199.000'}`)}</button>
              <p className="text-center text-sm text-gray-500 mt-4">{t('already_have_account')} <button onClick={() => navigate('/login')} className="text-primary hover:underline">{t('login_here')}</button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Register
