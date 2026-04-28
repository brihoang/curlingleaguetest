import type { Database } from './database.types'

export type SkillTier = Database['public']['Enums']['skill_tier']
export type UserRole = Database['public']['Enums']['user_role']
export type SeasonState = Database['public']['Enums']['season_state']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Season = Database['public']['Tables']['seasons']['Row']
