-- =============================================
-- TALLENTACAD — Schema Simplificado
-- Sem tenants — plataforma direta
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS (formandos e admin)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COURSES
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  language TEXT DEFAULT 'pt' CHECK (language IN ('pt', 'en')),
  type TEXT DEFAULT 'free' CHECK (type IN ('free', 'paid', 'sold')),
  price NUMERIC(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  access_days INT DEFAULT 90,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LESSONS
-- =============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT DEFAULT 0,
  unlock_after_days INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LESSON_CONTENTS
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'pdf', 'text')),
  url TEXT NOT NULL,
  filename TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUIZZES
-- =============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pass_score INT DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUIZ_QUESTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  order_index INT DEFAULT 0
);

-- =============================================
-- ENROLLMENTS (inscricoes)
-- =============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')),
  UNIQUE(course_id, user_id)
);

-- =============================================
-- LESSON_ACCESS
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(enrollment_id, lesson_id)
);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_user_id);

-- =============================================
-- ADMIN INICIAL (tu)
-- =============================================
-- Apos criar o teu utilizador no Supabase Auth,
-- executa isto com o teu auth_user_id:
-- INSERT INTO users (auth_user_id, email, name, role)
-- VALUES ('SEU_AUTH_USER_ID', 'teu@email.com', 'Bruno Barradas', 'admin');
