import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../components/ThemeToggle'
import LanguageToggle from '../components/LanguageToggle'
import { LogOut, Flame, Download, Edit3, Upload, Calendar, Settings, TrendingUp, Video, Eye, Clock, Menu, X, Crown, Star, CreditCard, AlertTriangle, Lock, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [userRole, setUserRole] = useState('free')
  const [remainingDays, setRemainingDays] = useState(7)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { t, language } = useLanguage()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session)
        
        if (!session) { 
          console.log('No session, redirecting to login')
          navigate('/login')
          return 
        }
        
        setUser(session.user)
        setLogoUrl(localStorage.getItem('app_logo'))
        
        // Get user role from localStorage or set default
        const storedRole = localStorage.getItem('user_role')
        console.log('Stored role:', storedRole)
        
        if (storedRole && (storedRole === 'premium' || storedRole === 'pro' || storedRole === 'free')) {
          setUserRole(storedRole)
        } else {
          // Default to free
          setUserRole('free')
          localStorage.setItem('user_role', 'free')
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error in dashboard:', err)
        setLoading(false)
        navigate('/login')
      }
    }
    
    getUser()
  }, [navigate])

  const handleLogout = async () => {
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    await supabase.auth.signOut()
    toast.success('Logout berhasil')
    navigate('/login')
  }

  const handleUpgradeClick = () => { 
    toast.info('Silakan upgrade akun Anda')
    navigate('/payment')
  }

  const menuItems = [
    { icon: Flame, titleId: 'viral_filter', titleEn: 'Viral Filter', path: "/viral-filter", requiredRole: 'free', color: "from-red-500 to-orange-500", isAvailable: true },
    { icon: Download, titleId: 'downloader', titleEn: 'Downloader', path: "/downloader", requiredRole: 'pro', color: "from-blue-500 to-cyan-500", isAvailable: (role) => role === 'pro' || role === 'premium' },
    { icon: Edit3, titleId: 'editor', titleEn: 'Editor', path: "/editor", requiredRole: 'pro', color: "from-green-500 to-emerald-500", isAvailable: (role) => role === 'pro' || role === 'premium' },
    { icon: Upload, titleId: 'auto_upload', titleEn: 'Auto Upload', path: "/uploader", requiredRole: 'pro', color: "from-purple-500 to-pink-500", isAvailable: (role) => role === 'pro' || role === 'premium' },
    { icon: Calendar, titleId: 'scheduler', titleEn: 'Scheduler', path: "/scheduler", requiredRole: 'premium', color: "from-yellow-500 to-orange-500", isAvailable: (role) => role === 'premium' },
    { icon: Settings, titleId: 'settings', titleEn: 'Settings', path: "/settings", requiredRole: 'free', color: "from-indigo-500 to-purple-500", isAvailable: true }
  ]

  const handleMenuClick = (item) => {
    const isAvailable = typeof item.isAvailable === 'function' ? item.isAvailable(userRole) : item.isAvailable
    if (!isAvailable) { 
      toast.error(`Fitur ${item.titleId} hanya untuk member ${item.requiredRole.toUpperCase()}`)
      return 
    }
    navigate(item.path)
  }

  const getSubscriptionBadge = () => {
    switch(userRole) {
      case 'premium': return <span className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1"><Crown className="w-3 h-3" /> PREMIUM</span>
      case 'pro': return <span className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center gap-1"><Star className="w-3 h-3" /> PRO</span>
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-500 text-white">FREE TRIAL</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-300">
      {/* Header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              <Menu className="w-5 h-5" />
            </button>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/dashboard')}>
              AUTOLIVE
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <img 
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=E63946&color=fff`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <span className="text-gray-700 dark:text-gray-300 text-sm">{user.email}</span>
              {getSubscriptionBadge()}
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-light-card dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex justify-between items-center lg:hidden border-b">
            <span className="font-bold">Menu</span>
            <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item, idx) => {
              const isAvailable = typeof item.isAvailable === 'function' ? item.isAvailable(userRole) : item.isAvailable
              return (
                <button 
                  key={idx} 
                  onClick={() => handleMenuClick(item)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${isAvailable ? 'hover:bg-gradient-to-r from-primary/10 to-secondary/10' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="text-gray-700 dark:text-gray-200">{t(item.titleId)}</span>
                  {!isAvailable && <Lock className="w-3 h-3 text-gray-400 ml-auto" />}
                </button>
              )
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Welcome Card */}
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 mb-8 border shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <img 
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=E63946&color=fff&size=80`} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {t('welcome')}, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
                  </h2>
                  {getSubscriptionBadge()}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('auto_content')}</p>
              </div>
              {(userRole === 'free') && (
                <button onClick={handleUpgradeClick} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Upgrade ke Pro ($3)
                </button>
              )}
              {(userRole === 'pro') && (
                <button onClick={handleUpgradeClick} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Upgrade ke Premium ($5)
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Access Title */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> {t('quick_access')}
          </h3>
          
          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, idx) => {
              const isAvailable = typeof item.isAvailable === 'function' ? item.isAvailable(userRole) : item.isAvailable
              return (
                <div 
                  key={idx} 
                  onClick={() => handleMenuClick(item)} 
                  className={`bg-light-card dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:scale-105 cursor-pointer group ${isAvailable ? 'hover:border-primary/50' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${item.color} bg-opacity-10 group-hover:bg-opacity-20 transition`}>
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{t(item.titleId)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'id' ? 'Klik untuk mengakses' : 'Click to access'}
                      </p>
                    </div>
                    {!isAvailable && <Lock className="w-4 h-4 text-gray-400" />}
                  </div>
                  {!isAvailable && (
                    <div className="mt-2 text-xs text-primary text-center">
                      🔒 {t('upgrade_to_access')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500">© 2026 AUTOLIVE - {t('auto_content')}</p>
          </div>
        </main>
      </div>
    </div>
  )
}
export default Dashboard
