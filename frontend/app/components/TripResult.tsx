'use client'

import { useState } from 'react'
import { TripPlan } from '../types/trip'
import { Calendar, MapPin, Clock, DollarSign, Share2, Download, RotateCcw } from 'lucide-react'
import TripMap from './TripMap'

interface TripResultProps {
  tripPlan: TripPlan
  onNewTrip: () => void
}

export default function TripResult({ tripPlan, onNewTrip }: TripResultProps) {
  const [activeDay, setActiveDay] = useState(1)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tripPlan.destination} 여행 일정`,
          text: tripPlan.overview,
          url: window.location.href,
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // 클립보드에 복사
      const shareText = `${tripPlan.destination} 여행 일정\n\n${tripPlan.overview}`
      navigator.clipboard.writeText(shareText)
      alert('일정이 클립보드에 복사되었습니다!')
    }
  }

  const handleDownload = () => {
    const content = generatePDFContent(tripPlan)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tripPlan.destination}_여행일정.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎯 {tripPlan.destination} 맞춤 여행 일정
            </h1>
            <p className="text-gray-600 text-lg">{tripPlan.overview}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              저장
            </button>
            <button
              onClick={onNewTrip}
              className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              새 일정
            </button>
          </div>
        </div>

        {/* 요약 정보 */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
          <div className="text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-semibold text-gray-800">{tripPlan.duration}일</div>
            <div className="text-sm text-gray-600">여행 기간</div>
          </div>
          <div className="text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="font-semibold text-gray-800">{tripPlan.totalBudget}만원</div>
            <div className="text-sm text-gray-600">총 예산</div>
          </div>
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="font-semibold text-gray-800">{tripPlan.days.reduce((acc, day) => acc + day.places.length, 0)}곳</div>
            <div className="text-sm text-gray-600">추천 장소</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 일정 상세 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 일차 선택 탭 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {tripPlan.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeDay === day.day
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {day.day}일차
                </button>
              ))}
            </div>

            {/* 선택된 일차 상세 */}
            {tripPlan.days
              .filter((day) => day.day === activeDay)
              .map((day) => (
                <div key={day.day} className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-bold text-gray-800">{day.theme}</h3>
                    <p className="text-gray-600">{day.date} • 예상 비용: {day.totalBudget}만원</p>
                  </div>

                  <div className="space-y-4">
                    {day.places.map((place, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">{place.name}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {place.estimatedTime}분
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{place.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {place.category}
                          </span>
                          {place.tips && (
                            <span className="text-sm text-gray-500">💡 {place.tips}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">🚗 교통수단</h5>
                    <p className="text-yellow-700">{day.transportation}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 지도 및 팁 */}
        <div className="space-y-6">
          {/* 지도 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 장소 위치</h3>
            <TripMap 
              places={tripPlan.days.find(d => d.day === activeDay)?.places || []} 
            />
          </div>

          {/* 여행 팁 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 여행 팁</h3>
            <div className="space-y-3">
              {tripPlan.tips.map((tip, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generatePDFContent(tripPlan: TripPlan): string {
  let content = `${tripPlan.destination} 여행 일정\n`
  content += `생성일: ${new Date(tripPlan.createdAt).toLocaleDateString()}\n`
  content += `기간: ${tripPlan.duration}일\n`
  content += `총 예산: ${tripPlan.totalBudget}만원\n\n`
  content += `개요: ${tripPlan.overview}\n\n`

  tripPlan.days.forEach((day) => {
    content += `=== ${day.day}일차: ${day.theme} ===\n`
    content += `날짜: ${day.date}\n`
    content += `예상 비용: ${day.totalBudget}만원\n\n`
    
    day.places.forEach((place, index) => {
      content += `${index + 1}. ${place.name} (${place.estimatedTime}분)\n`
      content += `   ${place.description}\n`
      if (place.tips) content += `   💡 ${place.tips}\n`
      content += `\n`
    })
    
    content += `교통: ${day.transportation}\n\n`
  })

  content += `=== 여행 팁 ===\n`
  tripPlan.tips.forEach((tip, index) => {
    content += `${index + 1}. ${tip}\n`
  })

  return content
}