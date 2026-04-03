import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { LogOut, Settings, Image, Users, Crown, Star, CreditCard, Save, RefreshCw, Shield, Menu, X, Palette, Mail, Trash2, Video, Eye, Clock, Zap, Activity, BarChart } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('app_logo') || null)
  const [websiteName, setWebsiteName] = useState(localStorage.getItem('website_name') || 'AUTOLIVE')
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('primary_color') || '#E63946')
  const [secondaryColor, setSecondaryColor] = useState(localStorage.getItem('secondary_color') || '#00B4D8')
  const [contactEmail, setContactEmail] = useState(localStorage.getItem('contact_email') || 'support@autolive.com')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({ users: 0, videos: 0, schedules: 0, revenue: 0 })
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { t, language } = useLanguage()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      setUser(session.user)
      await loadUsers()
      await loadStats()
      setLoading(false)
    }
    checkAdmin()
  }, [navigate])

  const loadStats = async () => {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: videoCount } = await supabase.from('videos').select('*', { count: 'exact', head: true })
    const { count: scheduleCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true })
    setStats({ users: userCount || 0, videos: videoCount || 0, schedules: scheduleCount || 0, revenue: 0 })
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => { localStorage.setItem('app_logo', event.target.result); setLogoUrl(event.target.result); toast.success('Logo berhasil diubah!') }
      reader.readAsDataURL(file)
    } else toast.error('Upload file gambar yang valid')
  }

  const handleSaveSettings = () => {
    localStorage.setItem('website_name', websiteName)
    localStorage.setItem('primary_color', primaryColor)
    localStorage.setItem('secondary_color', secondaryColor)
    localStorage.setItem('contact_email', contactEmail)
    document.documentElement.style.setProperty('--color-primary', primaryColor)
    document.documentElement.style.setProperty('--color-secondary', secondaryColor)
    toast.success('Pengaturan website disimpan!')
  }

  const updateUserSubscription = async (userId, subscription) => {
    const { error } = await supabase.from('users').update({ subscription }).eq('id', userId)
    if (error) toast.error('Gagal mengupdate user')
    else { toast.success(`Subscription diubah menjadi ${subscription}`); loadUsers() }
  }

  const updateUserRole = async (userId, role) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    if (error) toast.error('Gagal mengupdate role')
    else { toast.success(`Role diubah menjadi ${role}`); loadUsers() }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Yakin ingin menghapus user ini?')) {
      const { error } = await supabase.from('users').delete().eq('id', userId)
      if (error) toast.error('Gagal menghapus user')
      else { toast.success('User berhasil dihapus'); loadUsers() }
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('user_role'); localStorage.removeItem('user_email')
    await supabase.auth.signOut()
    toast.success('Logout berhasil')
    navigate('/login')
  }

  const adminMenuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard', color: 'from-purple-500 to-pink-500' },
    { id: 'users', icon: Users, label: t('user_management'), color: 'from-blue-500 to-cyan-500' },
    { id: 'settings', icon: Settings, label: t('website_settings'), color: 'from-indigo-500 to-purple-500' }
  ]

  if (loading) return <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-300">
      <div className="bg-light-card dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"><Menu className="w-5 h-5" /></button>{logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center"><span className="text-white font-bold text-sm">A</span></div>}<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AUTOLIVE - Admin Panel</h1></div>
          <div className="flex items-center gap-3"><LanguageToggle /><ThemeToggle /><div className="hidden md:flex items-center gap-2"><img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=E63946&color=fff`} alt="Avatar" className="w-8 h-8 rounded-full object-cover" /><span className="text-gray-700 dark:text-gray-300 text-sm">{user?.email}</span><span className="px-2 py-1 rounded-full text-xs bg-purple-500 text-white flex items-center gap-1"><Shield className="w-3 h-3" /> ADMIN</span></div><button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"><LogOut className="w-5 h-5 text-red-500" /></button></div>
        </div>
      </div>
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-light-card dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b"><div className="grid grid-cols-2 gap-3"><div className="bg-primary/10 rounded-xl p-3 text-center"><Users className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xl font-bold">{stats.users}</div><div className="text-xs text-gray-500">{t('users')}</div></div><div className="bg-primary/10 rounded-xl p-3 text-center"><Video className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xl font-bold">{stats.videos}</div><div className="text-xs text-gray-500">{t('videos')}</div></div></div></div>
          <nav className="p-4 space-y-1">{adminMenuItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === item.id ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}><item.icon className="w-5 h-5" /><span>{item.label}</span></button>))}</nav>
        </aside>
        <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
          {activeTab === 'dashboard' && (<div><h2 className="text-2xl font-bold mb-6">📊 {t('dashboard')} Admin</h2><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"><div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border"><div className="text-2xl font-bold text-primary">{stats.users}</div><div className="text-sm text-gray-500">{t('users')}</div></div><div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border"><div className="text-2xl font-bold text-primary">{stats.videos}</div><div className="text-sm text-gray-500">{t('videos')}</div></div><div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border"><div className="text-2xl font-bold text-primary">{stats.schedules}</div><div className="text-sm text-gray-500">{t('schedules')}</div></div><div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border"><div className="text-2xl font-bold text-primary">Rp 0</div><div className="text-sm text-gray-500">Revenue</div></div></div><div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border"><h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3><p className="text-gray-500">Belum ada aktivitas</p></div></div>)}
          {activeTab === 'users' && (<div><h2 className="text-2xl font-bold mb-6">👥 {t('user_management')}</h2><div className="bg-light-card dark:bg-dark-card rounded-xl overflow-hidden border"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-100 dark:bg-gray-800"><tr><th className="text-left p-3">Email</th><th className="text-left p-3">Nama</th><th className="text-left p-3">Subscription</th><th className="text-left p-3">Role</th><th className="text-left p-3">Aksi</th></tr></thead><tbody>{users.map((u) => (<tr key={u.id} className="border-b border-gray-200 dark:border-gray-800"><td className="p-3">{u.email}</td><td className="p-3">{u.full_name || '-'}</td><td className="p-3"><select value={u.subscription || 'free'} onChange={(e) => updateUserSubscription(u.id, e.target.value)} className="p-1 rounded border"><option value="free">Free</option><option value="pro">Pro</option><option value="premium">Premium</option></select></td><td className="p-3"><select value={u.role || 'user'} onChange={(e) => updateUserRole(u.id, e.target.value)} className="p-1 rounded border"><option value="user">User</option><option value="admin">Admin</option></select></td><td className="p-3"><button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></div></div>)}
          {activeTab === 'settings' && (<div><h2 className="text-2xl font-bold mb-6">⚙️ {t('website_settings')}</h2><div className="bg-light-card dark:bg-dark-card rounded-xl p-6 mb-6 border"><div className="flex items-center gap-3 mb-4"><Image className="w-6 h-6 text-primary" /><h3 className="text-lg font-semibold">{t('change_logo')}</h3></div><div className="flex items-center gap-4 flex-wrap">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-16 w-auto" /> : <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center"><span className="text-white font-bold text-xl">A</span></div>}<label className="cursor-pointer bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"><Image className="w-4 h-4" /> {t('change_logo')}<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label><button onClick={() => { localStorage.removeItem('app_logo'); setLogoUrl(null); toast.success('Logo direset'); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Reset Logo</button></div></div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 mb-6 border"><div className="flex items-center gap-3 mb-4"><Settings className="w-6 h-6 text-primary" /><h3 className="text-lg font-semibold">Nama Website</h3></div><input type="text" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" /></div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 mb-6 border"><div className="flex items-center gap-3 mb-4"><Palette className="w-6 h-6 text-primary" /><h3 className="text-lg font-semibold">Warna Tema</h3></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1">{t('primary_color')}</label><div className="flex gap-2"><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded border" /><input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 p-2 rounded-lg border" /></div></div><div><label className="block text-sm mb-1">{t('secondary_color')}</label><div className="flex gap-2"><input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-10 rounded border" /><input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 p-2 rounded-lg border" /></div></div></div></div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 mb-6 border"><div className="flex items-center gap-3 mb-4"><Mail className="w-6 h-6 text-primary" /><h3 className="text-lg font-semibold">{t('contact_email')}</h3></div><input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" /></div>
          <button onClick={handleSaveSettings} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"><Save className="w-5 h-5" /> {t('save_settings')}</button></div>)}
        </main>
      </div>
    </div>
  )
}
export default AdminDashboard
