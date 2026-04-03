-- ============================================
-- MEMBUAT TABEL UNTUK AUTOLIVE
-- ============================================

-- Hapus tabel jika ada (urutan terbalik karena foreign key)
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.saved_videos CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.user_platforms CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.website_settings CASCADE;

-- Tabel users
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    subscription TEXT DEFAULT 'free',
    subscription_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel videos
CREATE TABLE public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INT,
    status TEXT DEFAULT 'draft',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    viral_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel user_platforms
CREATE TABLE public.user_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    platform_user_id TEXT,
    platform_username TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Tabel schedules
CREATE TABLE public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    title TEXT,
    description TEXT,
    hashtags TEXT[],
    privacy_status TEXT DEFAULT 'public',
    status TEXT DEFAULT 'pending',
    uploaded_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel subscriptions
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    amount INTEGER,
    payment_method TEXT,
    payment_proof_url TEXT,
    status TEXT DEFAULT 'pending',
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel saved_videos
CREATE TABLE public.saved_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Tabel activity_logs
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel website_settings
CREATE TABLE public.website_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default website settings
INSERT INTO public.website_settings (key, value) VALUES
    ('website_name', 'AUTOLIVE'),
    ('website_logo', ''),
    ('primary_color', '#E63946'),
    ('secondary_color', '#00B4D8'),
    ('contact_email', 'support@autolive.com'),
    ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Nonaktifkan RLS untuk kemudahan development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platforms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings DISABLE ROW LEVEL SECURITY;

SELECT '✅ Database migration completed!' as status;
