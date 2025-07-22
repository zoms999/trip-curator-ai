import openai
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os
import googlemaps
from models.trip import TripRequest, TripPlan, DayPlan, Place, Coordinates

class TripGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY")) if os.getenv("GOOGLE_MAPS_API_KEY") else None
    
    async def generate_trip_plan(self, request: TripRequest) -> TripPlan:
        """AI를 사용하여 여행 일정 생성"""
        
        # OpenAI GPT를 사용하여 일정 생성
        prompt = self._create_prompt(request)
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 전문 여행 플래너입니다. 사용자의 요청에 따라 개인 맞춤형 여행 일정을 JSON 형태로 생성해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            # AI 응답 파싱
            ai_response = response.choices[0].message.content
            trip_data = self._parse_ai_response(ai_response, request)
            
            # 장소 좌표 정보 추가
            if self.gmaps:
                trip_data = await self._add_coordinates(trip_data, request.destination)
            
            return trip_data
            
        except Exception as e:
            # AI 호출 실패 시 기본 일정 생성
            return self._create_fallback_plan(request)
    
    def _create_prompt(self, request: TripRequest) -> str:
        """AI 프롬프트 생성"""
        style_desc = {
            'active': '액티브하고 모험적인',
            'relaxed': '편안하고 여유로운',
            'cultural': '문화와 역사 중심의',
            'foodie': '맛집과 음식 중심의',
            'nature': '자연과 풍경 중심의'
        }
        
        companion_desc = {
            'solo': '혼자 여행하는',
            'couple': '연인/부부와 함께하는',
            'family': '가족과 함께하는',
            'friends': '친구들과 함께하는'
        }
        
        interests_str = ', '.join(request.interests)
        
        prompt = f"""
다음 조건에 맞는 {request.destination} 여행 일정을 JSON 형태로 생성해주세요:

**여행 조건:**
- 목적지: {request.destination}
- 기간: {request.duration}일
- 예산: {request.budget}만원
- 여행 스타일: {style_desc.get(request.travel_style, request.travel_style)}
- 동반자: {companion_desc.get(request.companions, request.companions)}
- 관심사: {interests_str}

**요구사항:**
1. 각 일차별로 테마가 있는 일정 구성
2. 실제 존재하는 장소들로 구성
3. 이동 시간과 동선을 고려한 효율적인 일정
4. 예산에 맞는 현실적인 비용 계산
5. 각 장소별 추천 활동과 팁 포함

**JSON 형식:**
{{
  "overview": "여행 일정 전체 개요 (2-3문장)",
  "days": [
    {{
      "day": 1,
      "date": "2024-01-01",
      "theme": "일차별 테마",
      "places": [
        {{
          "name": "장소명",
          "description": "장소 설명 (1-2문장)",
          "category": "카테고리 (관광지/맛집/카페/쇼핑 등)",
          "estimated_time": 120,
          "tips": "방문 팁 (선택사항)"
        }}
      ],
      "total_budget": 15,
      "transportation": "교통수단 및 이동 정보"
    }}
  ],
  "tips": [
    "전체 여행에 대한 유용한 팁들"
  ]
}}

한국어로 작성하고, 실용적이고 구체적인 정보를 포함해주세요.
"""
        return prompt
    
    def _parse_ai_response(self, ai_response: str, request: TripRequest) -> TripPlan:
        """AI 응답을 TripPlan 객체로 변환"""
        try:
            # JSON 부분만 추출
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            json_str = ai_response[start_idx:end_idx]
            
            data = json.loads(json_str)
            
            # TripPlan 객체 생성
            trip_id = str(uuid.uuid4())
            created_at = datetime.now().isoformat()
            
            # 날짜 계산
            start_date = datetime.now() + timedelta(days=7)  # 일주일 후 시작
            
            days = []
            for i, day_data in enumerate(data.get('days', [])):
                current_date = start_date + timedelta(days=i)
                
                places = []
                for place_data in day_data.get('places', []):
                    place = Place(
                        name=place_data.get('name', ''),
                        description=place_data.get('description', ''),
                        category=place_data.get('category', '관광지'),
                        estimated_time=place_data.get('estimated_time', 60),
                        tips=place_data.get('tips')
                    )
                    places.append(place)
                
                day_plan = DayPlan(
                    day=day_data.get('day', i + 1),
                    date=current_date.strftime('%Y-%m-%d'),
                    theme=day_data.get('theme', f'{i + 1}일차'),
                    places=places,
                    total_budget=day_data.get('total_budget', request.budget // request.duration),
                    transportation=day_data.get('transportation', '대중교통 이용')
                )
                days.append(day_plan)
            
            return TripPlan(
                id=trip_id,
                destination=request.destination,
                duration=request.duration,
                total_budget=request.budget,
                overview=data.get('overview', f'{request.destination} {request.duration}일 여행 일정'),
                days=days,
                tips=data.get('tips', []),
                created_at=created_at
            )
            
        except Exception as e:
            print(f"AI 응답 파싱 오류: {e}")
            return self._create_fallback_plan(request)
    
    async def _add_coordinates(self, trip_plan: TripPlan, destination: str) -> TripPlan:
        """Google Maps API를 사용하여 장소 좌표 추가"""
        try:
            for day in trip_plan.days:
                for place in day.places:
                    search_query = f"{place.name} {destination}"
                    
                    # Places API로 장소 검색
                    places_result = self.gmaps.places(query=search_query)
                    
                    if places_result['results']:
                        location = places_result['results'][0]['geometry']['location']
                        place.coordinates = Coordinates(
                            lat=location['lat'],
                            lng=location['lng']
                        )
            
            return trip_plan
            
        except Exception as e:
            print(f"좌표 추가 오류: {e}")
            return trip_plan
    
    def _create_fallback_plan(self, request: TripRequest) -> TripPlan:
        """AI 호출 실패 시 기본 일정 생성"""
        trip_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        start_date = datetime.now() + timedelta(days=7)
        
        # 기본 장소들 (목적지별로 다르게 설정 가능)
        sample_places = [
            Place(
                name=f"{request.destination} 대표 관광지",
                description="현지에서 가장 유명한 관광 명소입니다.",
                category="관광지",
                estimated_time=120,
                tips="오전 일찍 방문하시면 사람이 적어요"
            ),
            Place(
                name="현지 맛집",
                description="현지인들이 추천하는 유명한 맛집입니다.",
                category="맛집",
                estimated_time=90,
                tips="예약을 미리 하시는 것을 추천합니다"
            )
        ]
        
        days = []
        for i in range(request.duration):
            current_date = start_date + timedelta(days=i)
            
            day_plan = DayPlan(
                day=i + 1,
                date=current_date.strftime('%Y-%m-%d'),
                theme=f"{i + 1}일차 - {request.destination} 탐방",
                places=sample_places[:2],  # 기본 2개 장소
                total_budget=request.budget // request.duration,
                transportation="대중교통 및 도보"
            )
            days.append(day_plan)
        
        return TripPlan(
            id=trip_id,
            destination=request.destination,
            duration=request.duration,
            total_budget=request.budget,
            overview=f"{request.destination}에서의 {request.duration}일간 여행을 위한 기본 일정입니다.",
            days=days,
            tips=[
                "현지 날씨를 미리 확인하세요",
                "여권과 필수 서류를 준비하세요",
                "현지 교통카드를 미리 구매하면 편리합니다"
            ],
            created_at=created_at
        )