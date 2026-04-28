export type SkillTier = 'beginner' | 'intermediate' | 'advanced'
export type UserRole = 'player' | 'drawmaster' | 'club_admin'
export type SeasonState = 'registration_open' | 'teams_finalized' | 'season_active' | 'season_complete'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          skill_tier: SkillTier
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          skill_tier: SkillTier
          role?: UserRole
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string | null
          skill_tier?: SkillTier
          role?: UserRole
        }
      }
      seasons: {
        Row: {
          id: string
          state: SeasonState
          sheet_count: number | null
          week_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          state?: SeasonState
          sheet_count?: number | null
          week_count?: number | null
          created_at?: string
        }
        Update: {
          state?: SeasonState
          sheet_count?: number | null
          week_count?: number | null
        }
      }
    }
  }
}
