export interface TripRequest {
  destination: string
  duration: number // 일 수
  budget: number // 예산 (만원)
  travelStyle: 'active' | 'relaxed' | 'cultural' | 'foodie' | 'nature'
  companions: 'solo' | 'couple' | 'family' | 'friends'
  interests: string[] // 관심사 키워드
}

export interface Place {
  name: string
  description: string
  category: string
  estimatedTime: number // 분
  coordinates?: {
    lat: number
    lng: number
  }
  tips?: string
}

export interface DayPlan {
  day: number
  date: string
  theme: string
  places: Place[]
  totalBudget: number
  transportation: string
}

export interface TripPlan {
  id: string
  destination: string
  duration: number
  totalBudget: number
  overview: string
  days: DayPlan[]
  tips: string[]
  createdAt: string
}