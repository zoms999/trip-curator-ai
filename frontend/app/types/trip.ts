export interface TripRequest {
  destination: string
  startDate: string // 출발일 (YYYY-MM-DD)
  endDate: string // 도착일 (YYYY-MM-DD)
  duration: number // 일 수
  budget: number // 예산 (만원)
  travel_style: ('active' | 'relaxed' | 'cultural' | 'foodie' | 'nature' | 'shopping' | 'nightlife' | 'wellness' | 'photography' | 'luxury')[]
  companions: 'solo' | 'couple' | 'family' | 'friends'
  interests: string[] // 관심사 키워드
}

export interface Place {
  name: string
  description: string
  category: string
  estimated_time: number // 분
  coordinates?: {
    lat: number
    lng: number
  }
  tips?: string
  recommended_menu?: string[] // 추천 메뉴/활동
  estimated_cost?: string // 예상 비용
  nearby_places?: string[] // 주변 정보
  image_url?: string // 이미지 URL
}

export interface DayPlan {
  day: number
  date: string
  theme: string
  places: Place[]
  total_budget: number
  transportation: string
}

export interface TripPlan {
  id: string
  destination: string
  duration: number
  total_budget: number
  overview: string
  days: DayPlan[]
  tips: string[]
  created_at: string
}