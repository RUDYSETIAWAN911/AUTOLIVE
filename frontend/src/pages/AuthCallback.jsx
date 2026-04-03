import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) navigate('/dashboard')
      else navigate('/login')
    }
    handleCallback()
  }, [navigate])
  return <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
}
export default AuthCallback
