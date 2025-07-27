-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  learning_level TEXT CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  target_accent TEXT CHECK (target_accent IN ('american', 'british', 'australian', 'canadian')) DEFAULT 'american',
  learning_goal TEXT CHECK (learning_goal IN ('professional', 'academic', 'social', 'travel', 'general')) DEFAULT 'general',
  daily_goal INTEGER DEFAULT 15,
  weekly_goal INTEGER DEFAULT 5,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_sessions table
CREATE TABLE public.practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sentence TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  duration INTEGER NOT NULL, -- in seconds
  session_type TEXT CHECK (session_type IN ('pronunciation', 'conversation', 'stress', 'fluency')) DEFAULT 'pronunciation',
  audio_url TEXT,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  daily_reminders BOOLEAN DEFAULT true,
  progress_reports BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT false,
  reminder_time TIME DEFAULT '09:00:00',
  playback_speed TEXT DEFAULT '1.0',
  microphone_sensitivity TEXT DEFAULT 'medium',
  auto_play BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  share_progress BOOLEAN DEFAULT false,
  anonymous_data BOOLEAN DEFAULT true,
  recording_storage TEXT DEFAULT '30',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_progress table for streak tracking
CREATE TABLE public.daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in seconds
  average_score DECIMAL DEFAULT 0,
  goal_met BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON public.practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
