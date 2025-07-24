'use client'

import { useState } from 'react'
import { TripPlan, Place } from '../types/trip'
import { Calendar, MapPin, Clock, DollarSign, Share2, Download, RotateCcw, Heart, ExternalLink, Navigation, Camera, Utensils, Coffee, Building, TreePine, ShoppingBag, Star, ChevronDown, ChevronUp } from 'lucide-react'
import TripMap from './TripMap'
import { Disclosure, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'

interface TripResultProps {
  tripPlan: TripPlan
  onNewTrip: () => void
}

// 카테고리별 아이콘과 색상 매핑
const getCategoryIcon = (category: string) => {
  const categoryMap: { [key: string]: { icon: any, color: string, bgColor: string } } = {
    '맛집': { icon: Utensils, color: 'text-red-600', bgColor: 'bg-red-50' },
    '카페': { icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    '관광지': { icon: Camera, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    '자연경관': { icon: TreePine, color: 'text-green-600', bgColor: 'bg-green-50' },
    '쇼핑': { icon: ShoppingBag, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    '박물관': { icon: Building, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    '미술관': { icon: Building, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  }
  return categoryMap[category] || { icon: MapPin, color: 'text-gray-600', bgColor: 'bg-gray-50' }
}

// 장소 이미지 플레이스홀더 생성
const getPlaceholderImage = (placeName: string, category: string) => {
  const colors = ['bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-green-400 to-green-600', 'bg-gradient-to-br from-purple-400 to-purple-600', 'bg-gradient-to-br from-red-400 to-red-600', 'bg-gradient-to-br from-yellow-400 to-yellow-600']
  const colorIndex = placeName.length % colors.length
  return colors[colorIndex]
}

export default function TripResult({ tripPlan, onNewTrip }: TripResultProps) {
  const [activeDay, setActiveDay] = useState(1)
  const [likedPlaces, setLikedPlaces] = useState<Set<string>>(new Set())
  
  const toggleLike = (placeName: string) => {
    const newLikedPlaces = new Set(likedPlaces)
    if (newLikedPlaces.has(placeName)) {
      newLikedPlaces.delete(placeName)
    } else {
      newLikedPlaces.add(placeName)
    }
    setLikedPlaces(newLikedPlaces)
  }
  
  const openExternalLink = (type: 'naver' | 'kakao' | 'instagram', placeName: string) => {
    const encodedPlace = encodeURIComponent(placeName)
    const links = {
      naver: `https://map.naver.com/v5/search/${encodedPlace}`,
      kakao: `https://map.kakao.com/link/search/${encodedPlace}`,
      instagram: `https://www.instagram.com/explore/tags/${encodedPlace.replace(/\s+/g, '')}/`
    }
    window.open(links[type], '_blank')
  }

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
                <motion.button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base relative ${activeDay === day.day
                    ? 'bg-blue-500 text-white font-semibold shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  {day.day}일차
                  {activeDay === day.day && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-500 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* 선택된 일차 상세 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {tripPlan.days
                  .find((day) => day.day === activeDay)
                  ?.places.map((place, index) => {
                    const categoryInfo = getCategoryIcon(place.category)
                    const IconComponent = categoryInfo.icon
                    const isLiked = likedPlaces.has(place.name)
                    
                    return (
                      <Disclosure key={index}>
                        {({ open }) => (
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* 장소 이미지 헤더 */}
                            <div className={`h-32 ${place.image_url ? 'bg-cover bg-center' : getPlaceholderImage(place.name, place.category)} relative`}
                                 style={place.image_url ? { backgroundImage: `url(${place.image_url})` } : {}}>
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                                <div className="flex items-center space-x-2">
                                  <div className={`p-2 rounded-full ${categoryInfo.bgColor}`}>
                                    <IconComponent className={`w-4 h-4 ${categoryInfo.color}`} />
                                  </div>
                                  <span className="text-white font-semibold text-lg">{place.name}</span>
                                </div>
                                <button
                                  onClick={() => toggleLike(place.name)}
                                  className="ml-auto p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                                >
                                  <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
                                </button>
                              </div>
                            </div>
                            
                            {/* 기본 정보 */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                                    {place.category}
                                  </span>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{place.estimated_time || (place as any).estimatedTime}분</span>
                                  </div>
                                </div>
                                <Disclosure.Button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                                  <span className="text-sm mr-1">상세보기</span>
                                  <ChevronDown className={`w-4 h-4 transform transition-transform ${open ? 'rotate-180' : ''}`} />
                                </Disclosure.Button>
                              </div>
                              
                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {place.description}
                              </p>
                              
                              {place.tips && (
                                <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                  <span className="text-amber-600 mt-0.5">💡</span>
                                  <span className="text-amber-800 text-sm">{place.tips}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* 확장 가능한 상세 정보 */}
                            <Transition
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                            >
                              <Disclosure.Panel className="px-4 pb-4 border-t border-gray-100">
                                <div className="pt-4 space-y-4">
                                  {/* 추천 메뉴/활동 */}
                                  {place.recommended_menu && place.recommended_menu.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                        추천 {place.category === '맛집' ? '메뉴' : '활동'}
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {place.recommended_menu.map((item, idx) => (
                                          <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 예상 비용 */}
                                  {place.estimated_cost && (
                                    <div>
                                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                        예상 비용
                                      </h5>
                                      <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                                        {place.estimated_cost}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* 주변 정보 */}
                                  {place.nearby_places && place.nearby_places.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                        근처 가볼 만한 곳
                                      </h5>
                                      <div className="space-y-1">
                                        {place.nearby_places.map((nearbyPlace, idx) => (
                                          <span key={idx} className="block text-sm text-gray-600 pl-6">
                                            • {nearbyPlace}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 바로가기 버튼들 */}
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                      <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                                      바로가기
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() => openExternalLink('naver', place.name)}
                                        className="flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                                      >
                                        <Navigation className="w-4 h-4 mr-1" />
                                        네이버 지도
                                      </button>
                                      <button
                                        onClick={() => openExternalLink('kakao', place.name)}
                                        className="flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors"
                                      >
                                        <Navigation className="w-4 h-4 mr-1" />
                                        카카오맵
                                      </button>
                                      <button
                                        onClick={() => openExternalLink('instagram', place.name)}
                                        className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm transition-colors"
                                      >
                                        <Camera className="w-4 h-4 mr-1" />
                                        인스타그램
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </Disclosure.Panel>
                            </Transition>
                          </div>
                        )}
                      </Disclosure>
                    )
                  })}
                  
                {/* 이동 시간 표시 */}
                {tripPlan.days.find((day) => day.day === activeDay)?.places && 
                 tripPlan.days.find((day) => day.day === activeDay)!.places.length > 1 && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm">예상 이동시간: 10-15분</span>
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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
          {/* 좋아요한 장소들 */}
          {likedPlaces.size > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-5 h-5 mr-2 text-red-500 fill-current" />
                <h3 className="text-lg font-semibold text-gray-800">마음에 든 장소</h3>
              </div>
              <div className="space-y-2">
                {Array.from(likedPlaces).map((placeName, index) => (
                  <motion.div
                    key={placeName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <span className="text-red-800 text-sm font-medium">{placeName}</span>
                    <button
                      onClick={() => toggleLike(placeName)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

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