import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowLeft, CreditCard, Building, Wallet, Copy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Payment = () => {
  const [user, setUser] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(null)
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
      else setUser(user)
      const plan = localStorage.getItem('selected_plan')
      if (plan === 'pro' || plan === 'premium') setSelectedPlan(plan)
      else navigate('/dashboard')
    }
    getUser()
  }, [navigate])

  const price = selectedPlan === 'pro' ? 99000 : 199000
  const paymentMethods = [
    { id: 'mandiri', name: 'Bank Mandiri', icon: <Building className="w-6 h-6" />, account: '1670010490901', owner: 'RUDY SETIAWAN', details: 'Transfer ke rekening Bank Mandiri' },
    { id: 'dana', name: 'DANA', icon: <Wallet className="w-6 h-6" />, account: '0895405573659', owner: 'RUDY SETIAWAN', details: 'Kirim ke akun DANA' },
    { id: 'paypal', name: 'PayPal', icon: <CreditCard className="w-6 h-6" />, account: 'https://www.paypal.me/RudySetiawan111', owner: 'Rudy Setiawan', details: 'Klik link untuk melakukan pembayaran', isLink: true },
    { id: 'minipay', name: 'MiniPay', icon: <CreditCard className="w-6 h-6" />, account: '+62895405573659', owner: 'RUDY SETIAWAN', details: 'Kirim ke nomor MiniPay' }
  ]

  const copyToClipboard = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); toast.success('Nomor berhasil disalin!'); setTimeout(() => setCopied(null), 2000) }

  const confirmPayment = async () => {
    setProcessing(true)
    setTimeout(async () => {
      const expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + 1)
      const { error } = await supabase.from('users').update({ subscription: selectedPlan, subscription_expiry: expiryDate.toISOString() }).eq('id', user.id)
      if (error) toast.error('Gagal memproses pembayaran')
      else { toast.success(`Selamat! Anda sekarang member ${selectedPlan?.toUpperCase()}`); localStorage.removeItem('selected_plan'); navigate('/dashboard') }
      setProcessing(false)
    }, 2000)
  }

  if (!selectedPlan) return null

  return (
    <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-end gap-3"><LanguageToggle /><ThemeToggle /></div>
      <div className="container mx-auto px-4 py-8 max-w-4xl"><button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary"><ArrowLeft className="w-4 h-4" /> {t('back') || 'Kembali'}</button>
        <div className="grid md:grid-cols-2 gap-8"><div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border"><h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ringkasan Pesanan</h2><div className="space-y-3"><div className="flex justify-between py-2 border-b"><span className="text-gray-600 dark:text-gray-400">Paket</span><span className="font-semibold text-gray-800 dark:text-white">{selectedPlan === 'pro' ? 'Pro' : 'Premium'}</span></div><div className="flex justify-between py-2 border-b"><span className="text-gray-600 dark:text-gray-400">Harga</span><span className="font-semibold text-primary">Rp {price.toLocaleString()}</span></div><div className="flex justify-between py-2"><span className="text-gray-600 dark:text-gray-400">Total</span><span className="font-bold text-xl text-primary">Rp {price.toLocaleString()}</span></div></div><div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"><p className="text-xs text-yellow-600 dark:text-yellow-400">💡 Pembayaran berlaku per bulan. Akun akan otomatis diblokir jika tidak diperpanjang.</p></div></div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border"><h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Metode Pembayaran</h2><div className="space-y-4">{paymentMethods.map((method) => (<div key={method.id} className="p-4 rounded-lg border"><div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-primary/10">{method.icon}</div><div><div className="font-semibold">{method.name}</div><div className="text-sm text-gray-500">{method.details}</div></div></div><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500">Atas nama: {method.owner}</p><p className="text-sm font-mono font-semibold">{method.account}</p></div>{method.isLink ? (<a href={method.account} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-red-700 transition">Bayar via {method.name}</a>) : (<button onClick={() => copyToClipboard(method.account, method.id)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 transition flex items-center gap-1">{copied === method.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Salin</button>)}</div></div>))}</div><button onClick={confirmPayment} disabled={processing} className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">{processing ? 'Memproses...' : `Konfirmasi Pembayaran Rp ${price.toLocaleString()}`}</button><p className="text-center text-xs text-gray-500 mt-4">Setelah transfer, klik konfirmasi. Akun akan aktif dalam 1x24 jam.</p></div>
        </div>
      </div>
    </div>
  )
}
export default Payment
