'use client'

import { useState } from 'react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { TripRequest } from '../types/trip'
import { MapPin, Calendar, DollarSign, Users, Heart } from 'lucide-react'

interface TripFormProps {
  onSubmit: (data: TripRequest) => void
  isLoading: boolean
}

const travelStyles = [
  { value: 'active', label: '액티브', desc: '모험과 활동적인 여행' },
  { value: 'relaxed', label: '휴양', desc: '편안하고 여유로운 여행' },
  { value: 'cultural', label: '문화', desc: '역사와 문화 탐방' },
  { value: 'foodie', label: '미식', desc: '맛집과 음식 중심' },
  { value: 'nature', label: '자연', desc: '자연과 풍경 감상' },
  { value: 'shopping', label: '쇼핑', desc: '쇼핑과 브랜드 탐방' },
  { value: 'nightlife', label: '나이트라이프', desc: '밤문화와 엔터테인먼트' },
  { value: 'wellness', label: '웰니스', desc: '힐링과 스파, 요가' },
  { value: 'photography', label: '포토그래피', desc: '사진 촬영 중심 여행' },
  { value: 'luxury', label: '럭셔리', desc: '고급스러운 프리미엄 여행' },
]

const companionTypes = [
  { value: 'solo', label: '혼자' },
  { value: 'couple', label: '연인/부부' },
  { value: 'family', label: '가족' },
  { value: 'friends', label: '친구들' },
]

// '피서', '해수욕장', '물놀이' 추가
const interestOptions = [
  '맛집', '카페', '쇼핑', '박물관', '미술관', '역사유적',
  '자연경관', '사진촬영', '야경', '전통문화', '현지체험', '액티비티',
  '피서', '해수욕장', '물놀이'
]

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm<TripRequest>()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([])
  const [selectedCompanions, setSelectedCompanions] = useState<string>('')
  
  // 날짜 변경 감지 및 기간 자동 계산
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  
  React.useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (end >= start) {
        const diffTime = end.getTime() - start.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days
        setValue('duration', diffDays)
      } else {
        setValue('duration', 0)
      }
    }
  }, [startDate, endDate, setValue])

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]
    setSelectedInterests(updated)
    setValue('interests', updated)
  }

  const toggleTravelStyle = (style: string) => {
    const updated = selectedTravelStyles.includes(style)
      ? selectedTravelStyles.filter(s => s !== style)
      : [...selectedTravelStyles, style]
    setSelectedTravelStyles(updated)
    setValue('travel_style', updated as any)
  }

  const onFormSubmit = (data: TripRequest) => {
    const tripData = {
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      budget: data.budget,
      travel_style: selectedTravelStyles as any,
      companions: selectedCompanions as any,
      interests: selectedInterests
    }
    console.log('전송할 데이터:', tripData)
    onSubmit(tripData)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* 여행지 */}
        <div className="space-y-3">
          <label className="flex items-center text-lg font-semibold text-gray-700">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            어디로 떠나시나요?
          </label>
          <input
            {...register('destination', { required: true })}
            type="text"
            placeholder="예: 제주도, 부산, 도쿄, 파리"
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
          />
        </div>

        {/* 여행 날짜 */}
        <div className="space-y-3">
          <label className="flex items-center text-lg font-semibold text-gray-700">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            여행 날짜
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">출발일</label>
              <input
                {...register('startDate', { required: true })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">도착일</label>
              <input
                {...register('endDate', { required: true })}
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 기간 & 예산 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center text-lg font-semibold text-gray-700">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              여행 기간 (자동 계산)
            </label>
            <div className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-lg text-gray-700">
              {watch('duration') ? `${watch('duration')}일` : '날짜를 선택하세요'}
            </div>
            <input
              {...register('duration')}
              type="hidden"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center text-lg font-semibold text-gray-700">
              <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
              예산 (만원)
            </label>
            <input
              {...register('budget', { required: true, min: 1 })}
              type="number"
              placeholder="50"
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* 여행 스타일 */}
        <div className="space-y-4">
          <label className="flex items-center text-lg font-semibold text-gray-700">
            <Heart className="w-5 h-5 mr-2 text-blue-500" />
            어떤 여행을 원하시나요? (복수 선택 가능)
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {travelStyles.map((style) => (
              <div
                key={style.value}
                className="cursor-pointer"
                onClick={() => toggleTravelStyle(style.value)}
              >
                <div className={`p-4 border-2 rounded-lg hover:border-blue-300 transition-colors ${selectedTravelStyles.includes(style.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                  }`}>
                  <div className="font-semibold text-gray-800">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 동반자 */}
        <div className="space-y-4">
          <label className="flex items-center text-lg font-semibold text-gray-700">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            누구와 함께 가시나요?
          </label>
          <div className="grid grid-cols-4 gap-3">
            {companionTypes.map((companion) => (
              <div
                key={companion.value}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCompanions(companion.value)
                  setValue('companions', companion.value as any)
                }}
              >
                <div className={`p-3 text-center border-2 rounded-lg hover:border-blue-300 transition-colors ${selectedCompanions === companion.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                  }`}>
                  <div className="font-semibold text-gray-800">{companion.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 관심사 */}
        <div className="space-y-4">
          <label className="text-lg font-semibold text-gray-700">
            관심 있는 활동을 선택해주세요 (복수 선택 가능)
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3 text-center border-2 rounded-lg transition-colors ${selectedInterests.includes(interest)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={
            isLoading || 
            selectedTravelStyles.length === 0 || 
            !selectedCompanions || 
            !watch('startDate') || 
            !watch('endDate') || 
            !watch('duration') || 
            watch('duration') <= 0
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
        >
          {isLoading ? '✨ AI가 일정을 만들고 있어요...' : '🎯 맞춤 일정 만들기'}
        </button>
      </form>
    </div>
  )
}