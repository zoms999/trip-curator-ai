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

  if (!tripPlan || !tripPlan.days || tripPlan.days.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">여행 일정을 불러오는 데 실패했습니다.</p>
        <button
          onClick={onNewTrip}
          className="mt-4 flex items-center mx-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          새 일정 만들기
        </button>
      </div>
    )
  }

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
      const shareUrl = window.location.href
      navigator.clipboard.writeText(shareUrl)
      alert('일정 링크가 클립보드에 복사되었습니다!')
    }
  }

  const handleDownload = () => {
    const content = generateTextContent(tripPlan)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tripPlan.destination}_여행일정.txt`
    document.body.appendChild(a) // a 태그를 DOM에 추가
    a.click()
    document.body.removeChild(a) // 클릭 후 제거
    URL.revokeObjectURL(url)
  } // --- 수정된 부분: 닫는 중괄호 추가 ---

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              🎯 {tripPlan.destination} 맞춤 여행 일정
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">{tripPlan.overview}</p>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <Download className="w-4 h-4 mr-2" />
              저장
            </button>
            <button
              onClick={onNewTrip}
              className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              새 일정
            </button>
          </div>
        </div>

        {/* 요약 정보 */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-xl">
          <div className="text-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-semibold text-gray-800 text-sm sm:text-base">{tripPlan.duration}일</div>
            <div className="text-xs sm:text-sm text-gray-600">여행 기간</div>
          </div>
          <div className="text-center">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-500" />
            <div className="font-semibold text-gray-800 text-sm sm:text-base">{tripPlan.total_budget}만원</div>
            <div className="text-xs sm:text-sm text-gray-600">총 예산</div>
          </div>
          <div className="text-center">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-500" />
            <div className="font-semibold text-gray-800 text-sm sm:text-base">{tripPlan.days.reduce((acc, day) => acc + day.places.length, 0)}곳</div>
            <div className="text-xs sm:text-sm text-gray-600">추천 장소</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 일정 상세 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 일차 선택 탭 */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {tripPlan.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${activeDay === day.day
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  {day.day}일차
                </button>
              ))}
            </div>

            {/* 선택된 일차 상세 */}
            {tripPlan.days
              .find((day) => day.day === activeDay)
              ?.places.map((place, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 mr-4">
                      {place.name}
                    </h4>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span>{place.estimated_time || place.estimatedTime}분</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                    {place.description}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      {place.category}
                    </span>
                    {(place.tips) && (
                      <div className="flex items-center text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 py-1 sm:px-4 sm:py-2 rounded-full border border-amber-200">
                        <span className="mr-2">💡</span>
                        <span>{place.tips}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 지도 및 팁 */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 {activeDay}일차 장소 위치</h3>
            <TripMap
              places={tripPlan.days.find(d => d.day === activeDay)?.places || []}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <span className="text-xl mr-2">💡</span>
              <h3 className="text-lg font-semibold text-gray-800">여행 팁</h3>
            </div>
            <div className="space-y-3">
              {tripPlan.tips.map((tip, index) => (
                <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-blue-800 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateTextContent(tripPlan: TripPlan): string {
  let content = `${tripPlan.destination} 여행 일정\n`
  content += "================================\n\n"
  content += `📅 기간: ${tripPlan.duration}일\n`
  content += `💰 총 예산: ${tripPlan.total_budget}만원\n`
  content += `📝 개요: ${tripPlan.overview}\n\n`

  tripPlan.days.forEach((day) => {
    content += `--- ${day.day}일차: ${day.theme} ---\n`
    content += `   날짜: ${day.date}\n`
    content += `   예상 비용: ${day.total_budget || day.totalBudget}만원\n\n`

    day.places.forEach((place, index) => {
      const estimatedTime = place.estimated_time || place.estimatedTime;
      content += `  ${index + 1}. ${place.name} (${estimatedTime}분)\n`
      content += `     - ${place.description}\n`
      if (place.tips) content += `     - 💡 ${place.tips}\n`
      content += `\n`
    })

    content += `   🚗 교통: ${day.transportation}\n\n`
  })

  content += `--- 여행 팁 ---\n`
  tripPlan.tips.forEach((tip, index) => {
    content += `- ${tip}\n`
  })

  return content
}