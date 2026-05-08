export type TenantStatus = 'active' | 'inactive' | 'suspended'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonContentType = 'video' | 'audio' | 'pdf' | 'text'
export type UserRole = 'admin' | 'instructor' | 'student'
export type EnrollmentStatus = 'active' | 'expired' | 'cancelled'

export interface Tenant {
  id: string
  slug: string
  name: string
  email: string
  logo_url?: string
  status: TenantStatus
  created_at: string
}

export interface Plan {
  id: string
  tenant_id: string
  stripe_subscription_id: string
  plan_type: 'starter' | 'pro' | 'enterprise'
  max_courses: number
  max_students: number
  starts_at: string
  ends_at: string
  status: 'active' | 'cancelled' | 'past_due'
}

export interface Course {
  id: string
  tenant_id: string
  title: string
  slug: string
  description?: string
  language: 'pt' | 'en'
  thumbnail_url?: string
  starts_at: string
  ends_at: string
  access_days: number
  status: CourseStatus
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  order_index: number
  unlock_after_days: number
  status: 'draft' | 'published'
}

export interface LessonContent {
  id: string
  lesson_id: string
  type: LessonContentType
  url: string
  filename?: string
  order_index: number
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  pass_score: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_index: number
  order_index: number
}

export interface TenantUser {
  id: string
  tenant_id: string
  email: string
  name: string
  role: UserRole
  status: 'active' | 'inactive'
  created_at: string
}

export interface Enrollment {
  id: string
  course_id: string
  user_id: string
  enrolled_at: string
  expires_at: string
  status: EnrollmentStatus
}

export interface LessonAccess {
  id: string
  enrollment_id: string
  lesson_id: string
  unlocked_at?: string
  completed_at?: string
  is_completed: boolean
}
