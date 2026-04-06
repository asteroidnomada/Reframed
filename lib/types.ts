// Database types matching the schema in docs/architecture.md

export type PlanTier = 'free' | 'pro'
export type BillingState = 'active' | 'grace' | 'inactive'
export type ValidationStatus = 'pending' | 'passed' | 'failed'
export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type StylePreset = 'minimalist' | 'industrial' | 'warm_neighborhood'

export interface User {
  id: string
  email: string
  name: string | null
  plan_tier: PlanTier
  stripe_customer_id: string | null
  billing_state: BillingState
  grace_period_ends_at: string | null
  generation_count_this_month: number
  quota_reset_at: string
  created_at: string
  updated_at: string
}

export interface Space {
  id: string
  user_id: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface Capture {
  id: string
  space_id: string
  user_id: string
  original_storage_path: string
  working_copy_path: string
  thumbnail_path: string
  validation_status: ValidationStatus
  validation_failure_reason: string | null
  file_size_bytes: number | null
  dimensions_width: number | null
  dimensions_height: number | null
  device_info: Record<string, unknown> | null
  created_at: string
}

export interface Generation {
  id: string
  capture_id: string
  space_id: string
  user_id: string
  style_preset: StylePreset
  status: GenerationStatus
  output_storage_path: string | null
  display_path: string | null
  thumbnail_path: string | null
  model_id: string | null
  model_version: string | null
  generation_duration_ms: number | null
  error_message: string | null
  counted_against_quota: boolean
  created_at: string
  completed_at: string | null
}

export interface ShareLink {
  id: string
  generation_id: string
  user_id: string
  access_token: string
  expires_at: string
  view_count: number
  created_at: string
}

export interface GuestSession {
  id: string
  ip_address: string
  generation_id: string | null
  migrated_to_user: string | null
  expires_at: string
  created_at: string
}

// API response types
export interface ApiError {
  error: string
  code?: string
}

export interface GenerationJobResponse {
  generation_id: string
}

export interface SignedUrlResponse {
  url: string
  expires_at: string
}

export interface ShareLinkResponse {
  token: string
  url: string
  expires_at: string
}

export interface AccountResponse {
  user: User
  quota: {
    used: number
    limit: number
    resets_at: string
  }
}
