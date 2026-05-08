-- =============================================
-- TALLENTACAD — Schema Supabase (PostgreSQL)
-- Executar no SQL Editor do Supabase
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TENANTS (Empresas clientes da plataforma)
-- =============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,          -- ex: empresaxpto
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PLANS (Subscrições Stripe por tenant)
-- =============================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro', 'enterprise')),
  max_courses INT DEFAULT 3,
  max_students INT DEFAULT 50,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COURSES (Cursos criados pelas empresas)
-- =============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'pt' CHECK (language IN ('pt', 'en')),
  thumbnail_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  access_days INT DEFAULT 90,         -- dias de acesso após inscrição
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- =============================================
-- LESSONS (Lições de cada curso)
-- =============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  unlock_after_days INT DEFAULT 0,    -- dias após início do curso para desbloquear
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LESSON_CONTENTS (Conteúdos de cada lição)
-- =============================================
CREATE TABLE lesson_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'pdf', 'text')),
  url TEXT NOT NULL,                  -- URL no Cloudflare R2
  filename TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUIZZES (Quiz de verificação por lição)
-- =============================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pass_score INT DEFAULT 70,          -- % mínima para passar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUIZ_QUESTIONS (Perguntas do quiz)
-- =============================================
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,             -- ["opção A", "opção B", "opção C", "opção D"]
  correct_index INT NOT NULL,         -- índice da resposta correta (0-3)
  order_index INT DEFAULT 0
);

-- =============================================
-- TENANT_USERS (Utilizadores de cada empresa)
-- =============================================
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- =============================================
-- ENROLLMENTS (Inscrições nos cursos)
-- =============================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES tenant_users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,    -- calculado: enrolled_at + access_days
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  UNIQUE(course_id, user_id)
);

-- =============================================
-- LESSON_ACCESS (Controlo de acesso por lição)
-- =============================================
CREATE TABLE lesson_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(enrollment_id, lesson_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_access ENABLE ROW LEVEL SECURITY;

-- Política: cada utilizador vê apenas dados do seu tenant
CREATE POLICY "tenant_isolation" ON courses
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "tenant_isolation" ON tenant_users
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
  ));

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX idx_courses_tenant ON courses(tenant_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_access_enrollment ON lesson_access(enrollment_id);
CREATE INDEX idx_tenant_users_auth ON tenant_users(auth_user_id);
CREATE INDEX idx_tenants_slug ON tenants(slug);
