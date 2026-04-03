import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { Upload, TrendingUp, Edit, Zap, Shield, Clock, Video, UserPlus, Mail, Lock, Eye, EyeOff, LogIn, X, Crown, Star, Shield as ShieldIcon, User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [websiteName, setWebsiteName] = useState('AUTOLIVE')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('free')
  const [adminEmail, setAdminEmail] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const adminEmails = [
    'autolive1.0.0@gmail.com',
    'marga.jaya.bird.shop@gmail.com',
    'rudysetiawan111@gmail.com'
  ]
  const adminPassword = '@Rs101185'

  useEffect(() => {
    setLogoUrl(localStorage.getItem('app_logo'))
    setWebsiteName(localStorage.getItem('website_name') || 'AUTOLIVE')
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const userRole = localStorage.getItem('user_role')
        console.log('Session found, user_role:', userRole)
        
        if (userRole === 'admin') {
          console.log('Redirecting to /admin')
          navigate('/admin', { replace: true })
        } else if (userRole === 'premium' || userRole === 'pro' || userRole === 'free') {
          console.log('Redirecting to /dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          // No role stored, check database
          const { data: userData } = await supabase
            .from('users')
            .select('role, subscription')
            .eq('id', session.user.id)
            .single()
          
          if (userData?.role === 'admin') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      }
    }
    checkSession()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Email dan password harus diisi')
      return
    }

    setLoading(true)
    try {
      // Cek apakah ini admin
      if (adminEmails.includes(formData.email) && formData.password === adminPassword) {
        // Login ke Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) {
          // Jika belum punya akun, buat dulu
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.email.split('@')[0]
              }
            }
          })
          
          if (signUpError) throw signUpError
        }
        
        setAdminEmail(formData.email)
        setShowWelcomeModal(true)
        setLoading(false)
        return
      }

      // Login untuk user biasa
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.email.split('@')[0]
              }
            }
          })
          
          if (signUpError) throw signUpError
          
          if (signUpData.user) {
            setPendingUser(signUpData.user)
            setShowRoleModal(true)
            setLoading(false)
            return
          }
        }
        throw error
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('subscription')
          .eq('id', data.user.id)
          .single()
        
        const userSubscription = userData?.subscription || 'free'
        localStorage.setItem('user_role', userSubscription)
        toast.success(`Selamat datang ${userSubscription.toUpperCase()} User!`)
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login gagal')
      setLoading(false)
    }
  }

  const handleAccessSelection = (role) => {
    console.log('Selected role:', role)
    setShowWelcomeModal(false)
    localStorage.setItem('user_role', role)
    localStorage.setItem('user_email', adminEmail)
    
    if (role === 'admin') {
      toast.success('Masuk sebagai Admin')
      console.log('Navigating to /admin')
      navigate('/admin', { replace: true })
    } else {
      toast.success(`Masuk sebagai ${role.toUpperCase()} User`)
      console.log('Navigating to /dashboard')
      navigate('/dashboard', { replace: true })
    }
  }

  const handleRoleSelection = async () => {
    if (!pendingUser) {
      toast.error('Data user tidak ditemukan')
      return
    }
    
    setLoading(true)
    
    try {
      const finalRole = selectedRole
      let subscriptionExpiry = null
      let needPayment = false
      
      if (finalRole === 'free') {
        subscriptionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } else if (finalRole === 'pro') {
        needPayment = true
      } else if (finalRole === 'premium') {
        needPayment = true
      }
      
      if (needPayment) {
        localStorage.setItem('selected_plan', finalRole)
        localStorage.setItem('pending_user_id', pendingUser.id)
        localStorage.setItem('pending_user_email', pendingUser.email)
        localStorage.setItem('pending_user_name', pendingUser.user_metadata?.full_name || pendingUser.email.split('@')[0])
        
        setShowRoleModal(false)
        toast.info('Silakan lanjutkan ke pembayaran untuk mengaktifkan akun')
        navigate('/payment', { replace: true })
        setLoading(false)
        return
      }
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: pendingUser.id,
          email: pendingUser.email,
          full_name: pendingUser.user_metadata?.full_name || pendingUser.email.split('@')[0],
          role: 'user',
          subscription: 'free',
          subscription_expiry: subscriptionExpiry
        }, { onConflict: 'id' })
      
      if (error) {
        console.error('Save error:', error)
      }
      
      localStorage.setItem('user_role', 'free')
      toast.success(`Akun FREE berhasil diaktifkan!`)
      setShowRoleModal(false)
      navigate('/dashboard', { replace: true })
      
    } catch (error) {
      console.error('Save role error:', error)
      toast.error('Terjadi kesalahan, tetapi Anda tetap bisa melanjutkan')
      setShowRoleModal(false)
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = () => {
    navigate('/register')
  }

  const features = [
    { icon: Upload, titleId: 'Upload Otomatis', titleEn: 'Auto Upload', descId: "Upload otomatis ke YouTube & TikTok", descEn: "Auto upload to YouTube & TikTok", longDescId: "Fitur ini memungkinkan Anda mengupload video secara otomatis.", longDescEn: "Auto upload videos to YouTube & TikTok.", color: "from-red-500 to-orange-500" },
    { icon: TrendingUp, titleId: 'Filter Viral', titleEn: 'Viral Filter', descId: "Filter konten yang sedang viral", descEn: "Filter trending content", longDescId: "Temukan konten viral di berbagai platform.", longDescEn: "Find trending content across platforms.", color: "from-blue-500 to-cyan-500" },
    { icon: Edit, titleId: 'Editor AI', titleEn: 'AI Editor', descId: "Edit video dengan AI", descEn: "Edit videos with AI", longDescId: "Editor video berbasis AI dengan subtitle otomatis.", longDescEn: "AI-powered video editor with auto subtitles.", color: "from-green-500 to-emerald-500" },
    { icon: Zap, titleId: 'Proses Cepat', titleEn: 'Fast Processing', descId: "Proses cepat & efisien", descEn: "Fast & efficient", longDescId: "Proses upload dan editing yang cepat.", longDescEn: "Fast upload and editing process.", color: "from-yellow-500 to-orange-500" },
    { icon: Shield, titleId: 'Keamanan', titleEn: 'Secure', descId: "Keamanan terjamin", descEn: "Enterprise security", longDescId: "Data Anda aman dan terenkripsi.", longDescEn: "Your data is safe and encrypted.", color: "from-purple-500 to-pink-500" },
    { icon: Clock, titleId: 'Penjadwalan', titleEn: 'Schedule', descId: "Jadwalkan upload", descEn: "Schedule uploads", longDescId: "Atur jadwal upload otomatis.", longDescEn: "Set automatic upload schedule.", color: "from-indigo-500 to-purple-500" }
  ]

  return (
    <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-end gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full fade-in">
          <div className="text-center mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-primary to-secondary mb-4">
                <Video className="w-10 h-10 text-white" />
              </div>
            )}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{websiteName}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{language === 'id' ? 'Platform Upload Konten Otomatis' : 'Auto Content Upload Platform'}</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'id' ? 'Email' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-primary" placeholder={language === 'id' ? 'Masukkan email Anda' : 'Enter your email'} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'id' ? 'Password' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-primary" placeholder={language === 'id' ? 'Masukkan password' : 'Enter your password'} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50">
                    <LogIn className="w-5 h-5" />
                    {loading ? (language === 'id' ? 'Memproses...' : 'Processing...') : (language === 'id' ? 'Masuk' : 'Login')}
                  </button>
                </div>
              </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-light-card dark:bg-dark-card text-gray-500">{language === 'id' ? 'Belum punya akun?' : 'Don\'t have an account?'}</span></div>
              </div>
              
              <button onClick={handleRegisterClick} className="w-full flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl transition">
                <UserPlus className="w-5 h-5" /> {language === 'id' ? 'Daftar Sekarang' : 'Register Now'}
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-center text-gray-700 dark:text-gray-400 text-lg font-semibold mb-6">{language === 'id' ? 'Fitur Unggulan' : 'Features'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} onClick={() => setSelectedFeature(feature)} className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10 group-hover:bg-opacity-20 transition`}>
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{language === 'id' ? feature.titleId : feature.titleEn}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{language === 'id' ? feature.descId : feature.descEn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-3 border border-gray-200 dark:border-gray-800"><div className="text-2xl font-bold text-primary">10K+</div><div className="text-xs text-gray-500">{language === 'id' ? 'Pengguna' : 'Users'}</div></div>
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-3 border border-gray-200 dark:border-gray-800"><div className="text-2xl font-bold text-primary">1M+</div><div className="text-xs text-gray-500">{language === 'id' ? 'Video' : 'Videos'}</div></div>
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-3 border border-gray-200 dark:border-gray-800"><div className="text-2xl font-bold text-primary">50+</div><div className="text-xs text-gray-500">{language === 'id' ? 'Negara' : 'Countries'}</div></div>
          </div>
          
          <p className="text-center text-gray-500 dark:text-gray-500 text-xs mt-8">© 2026 {websiteName} - {language === 'id' ? 'Platform Upload Konten Otomatis' : 'Auto Content Upload Platform'}</p>
        </div>
      </div>
      
      {/* Welcome Modal untuk Admin */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-xl max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {language === 'id' ? 'Selamat Datang Admin!' : 'Welcome Admin!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {language === 'id' 
                ? 'Silakan pilih akses yang akan Anda gunakan' 
                : 'Please select the access you want to use'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {language === 'id' ? `Email: ${adminEmail}` : `Email: ${adminEmail}`}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleAccessSelection('admin')}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
              >
                <div className="flex items-center gap-3">
                  <ShieldIcon className="w-6 h-6 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {language === 'id' ? 'Akses Admin' : 'Admin Access'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'id' ? 'Akses penuh ke Panel Admin' : 'Full access to Admin Panel'}
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </button>
              
              <button
                onClick={() => handleAccessSelection('premium')}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {language === 'id' ? 'Akses Premium' : 'Premium Access'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'id' ? 'Akses semua fitur lengkap' : 'Full feature access'}
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-yellow-500" />
              </button>
              
              <button
                onClick={() => handleAccessSelection('pro')}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {language === 'id' ? 'Akses Pro' : 'Pro Access'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'id' ? 'Akses semua fitur kecuali jadwal' : 'All features except scheduler'}
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </button>
              
              <button
                onClick={() => handleAccessSelection('free')}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-500 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition"
              >
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-gray-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {language === 'id' ? 'Akses Free Trial' : 'Free Trial Access'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'id' ? 'Akses fitur terbatas 1 hari' : 'Limited features for 1 day'}
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFeature(null)}>
          <div className="bg-light-card dark:bg-dark-card rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${selectedFeature.color} bg-opacity-10`}>
                <selectedFeature.icon className="w-6 h-6 text-primary" />
              </div>
              <button onClick={() => setSelectedFeature(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{language === 'id' ? selectedFeature.titleId : selectedFeature.titleEn}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{language === 'id' ? selectedFeature.longDescId : selectedFeature.longDescEn}</p>
            <button onClick={() => setSelectedFeature(null)} className="w-full py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition">{language === 'id' ? 'Tutup' : 'Close'}</button>
          </div>
        </div>
      )}
      
      {/* Role Selection Modal untuk User Baru */}
      {showRoleModal && pendingUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{language === 'id' ? 'Pilih Status Akun' : 'Select Account Status'}</h2>
              <button onClick={() => { setShowRoleModal(false); setLoading(false); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-gray-500 mb-4">Email: {pendingUser.email}</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <input type="radio" name="role" value="free" checked={selectedRole === 'free'} onChange={() => setSelectedRole('free')} />
                <div><div className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Free Trial (1 {language === 'id' ? 'Hari' : 'Day'})</div><div className="text-xs text-gray-500">{language === 'id' ? 'Akses semua fitur selama 1 hari' : 'Access all features for 1 day'}</div></div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <input type="radio" name="role" value="pro" checked={selectedRole === 'pro'} onChange={() => setSelectedRole('pro')} />
                <div><div className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-blue-500" /> Pro (Rp 99.000/{language === 'id' ? 'bulan' : 'month'})</div><div className="text-xs text-gray-500">💳 {language === 'id' ? 'Perlu pembayaran' : 'Payment required'}</div></div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <input type="radio" name="role" value="premium" checked={selectedRole === 'premium'} onChange={() => setSelectedRole('premium')} />
                <div><div className="font-semibold flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Premium (Rp 199.000/{language === 'id' ? 'bulan' : 'month'})</div><div className="text-xs text-gray-500">💳 {language === 'id' ? 'Perlu pembayaran' : 'Payment required'}</div></div>
              </label>
            </div>
            
            <button onClick={handleRoleSelection} disabled={loading} className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
              {loading ? (language === 'id' ? 'Memproses...' : 'Processing...') : (language === 'id' ? 'Lanjutkan' : 'Continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default Login
