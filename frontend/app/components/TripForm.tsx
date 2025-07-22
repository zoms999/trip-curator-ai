'use client'

import { useState } from 'react'
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
]

const companionTypes = [
  { value: 'solo', label: '혼자' },
  { value: 'couple', label: '연인/부부' },
  { value: 'family', label: '가족' },
  { value: 'friends', label: '친구들' },
]

const interestOptions = [
  '맛집', '카페', '쇼핑', '박물관', '미술관', '역사유적', 
  '자연경관', '사진촬영', '야경', '전통문화', '현지체험', '액티비티'
]

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm<TripRequest>()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]
    setSelectedInterests(updated)
    setValue('interests', updated)
  }

  const onFormSubmit = (data: TripRequest) => {
    onSubmit({ ...data, interests: selectedInterests })
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

        {/* 기간 & 예산 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center text-lg font-semibold text-gray-700">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              여행 기간
            </label>
            <select
              {...register('duration', { required: true })}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            >
              <option value="">선택하세요</option>
              <option value={1}>당일치기</option>
              <option value={2}>1박 2일</option>
              <option value={3}>2박 3일</option>
              <option value={4}>3박 4일</option>
              <option value={5}>4박 5일</option>
              <option value={7}>6박 7일</option>
            </select>
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
            어떤 여행을 원하시나요?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {travelStyles.map((style) => (
              <label key={style.value} className="cursor-pointer">
                <input
                  {...register('travelStyle', { required: true })}
                  type="radio"
                  value={style.value}
                  className="sr-only"
                />
                <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50">
                  <div className="font-semibold text-gray-800">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.desc}</div>
                </div>
              </label>
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
              <label key={companion.value} className="cursor-pointer">
                <input
                  {...register('companions', { required: true })}
                  type="radio"
                  value={companion.value}
                  className="sr-only"
                />
                <div className="p-3 text-center border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50">
                  <div className="font-semibold text-gray-800">{companion.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 관심사 */}
        <div className="space-y-4">
          <label className="text-lg font-semibold text-gray-700">
            관심 있는 활동을 선택해주세요 (복수 선택 가능)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3 text-center border-2 rounded-lg transition-colors ${
                  selectedInterests.includes(interest)
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
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
        >
          {isLoading ? '✨ AI가 일정을 만들고 있어요...' : '🎯 맞춤 일정 만들기'}
        </button>
      </form>
    </div>
  )
}