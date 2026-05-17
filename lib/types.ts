export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user'
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  game: string
  description: string | null
  image_url: string | null
  registration_fee: string | null
  location: string | null
  contact_info: string | null
  start_date: string
  end_date: string
  registration_deadline: string
  max_teams: number
  team_size: number
  prize_pool: string | null
  rules: string | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  logo_url: string | null
  captain_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'captain' | 'member'
  joined_at: string
}

export interface TournamentRegistration {
  id: string
  tournament_id: string
  team_id: string
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  registered_by: string
  registered_at: string
  updated_at: string
}

export interface TeamWithMembers extends Team {
  team_members: (TeamMember & { profiles: Profile })[]
  captain: Profile
}

export interface TournamentWithRegistrations extends Tournament {
  registrations_count: number
  creator: Profile
}

export interface RegistrationWithDetails extends TournamentRegistration {
  tournament: Tournament
  team: TeamWithMembers
  registered_by_profile: Profile
}
