import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oaelvazbrxtyylpxqdfx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWx2YXpicnh0eXlscHhxZGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODMzODksImV4cCI6MjA5MDM1OTM4OX0.KRDJLXdTVdvK9Db75-S9qDQwqr9n1b9uARYmTyb-OPE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
