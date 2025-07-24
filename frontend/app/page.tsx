'use client'

import { useState } from 'react'
import TripForm from './components/TripForm'
import TripResult from './components/TripResult'
import { TripRequest, TripPlan } from './types/trip'

export default function Home() {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTripGenerate = async (tripRequest: TripRequest) => {
    setIsLoading(true)
    try {
      console.log('전송할 데이터:', tripRequest)
      
      // 실제 AI 일정 생성 시도
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/generate-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripRequest),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('서버 응답:', errorText)
        throw new Error('일정 생성에 실패했습니다')
      }
      
      const plan = await response.json()
      console.log('AI 일정 생성 성공:', plan)
      console.log('일정 데이터 구조:', JSON.stringify(plan, null, 2))
      setTripPlan(plan)
    } catch (error) {
      console.error('Error generating trip:', error)
      alert('일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧳 트립 큐레이터 AI
          </h1>
          <p className="text-xl text-gray-600">
            AI가 당신만을 위한 완벽한 여행 일정을 만들어드립니다
          </p>
        </header>

        {!tripPlan ? (
          <TripForm onSubmit={handleTripGenerate} isLoading={isLoading} />
        ) : (
          <TripResult 
            tripPlan={tripPlan} 
            onNewTrip={() => setTripPlan(null)} 
          />
        )}
      </div>
    </main>
  )
}