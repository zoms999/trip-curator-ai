# 파일 경로: services/trip_generator.py

import google.generativeai as genai
import json
import uuid
from datetime import datetime, timedelta
from typing import List
import os
import googlemaps
from models.trip import TripRequest, TripPlan, DayPlan, Place, Coordinates

class TripGenerator:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        # 최신 모델 사용 권장 (gemini-1.5-flash 또는 gemini-1.5-pro)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY")) if os.getenv("GOOGLE_MAPS_API_KEY") else None
    
    async def generate_trip_plan(self, request: TripRequest) -> TripPlan:
        prompt = self._create_prompt(request)
        try:
            full_prompt = f"""당신은 전문 여행 플래너입니다. 사용자의 요청에 따라 개인 맞춤형 여행 일정을 JSON 형태로 생성해주세요.

{prompt}

중요: 반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트나 ```json 마크다운은 포함하지 마세요."""
            
            print(f"--- Gemini API Prompt ---\n{full_prompt}\n--------------------------")
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=8192,
                )
            )
            
            ai_response = response.text
            print(f"--- Gemini API Response ---\n{ai_response}\n--------------------------")
            trip_data = self._parse_ai_response(ai_response, request)
            
            if self.gmaps:
                trip_data = await self._add_coordinates(trip_data, request.destination)
            
            return trip_data
        except Exception as e:
            print(f"AI 호출 오류: {e}")
            import traceback
            traceback.print_exc()
            return self._create_fallback_plan(request)

    def _create_prompt(self, request: TripRequest) -> str:
        style_desc = {
            'active': '액티브하고 모험적인', 'relaxed': '편안하고 여유로운',
            'cultural': '문화와 역사 중심의', 'foodie': '맛집과 음식 중심의',
            'nature': '자연과 풍경 중심의', 'shopping': '쇼핑과 브랜드 탐방 중심의',
            'nightlife': '밤문화와 엔터테인먼트 중심의', 'wellness': '힐링과 웰니스 중심의',
            'photography': '사진 촬영과 인스타그램 중심의', 'luxury': '고급스럽고 프리미엄한'
        }
        companion_desc = {
            'solo': '혼자 여행하는', 'couple': '연인/부부와 함께하는',
            'family': '가족과 함께하는', 'friends': '친구들과 함께하는'
        }
        
        interests_str = ', '.join(request.interests)
        travel_styles_str = ', '.join([style_desc.get(style, style) for style in request.travel_style])

        prompt = f"""
**여행 조건:**
- 목적지: {request.destination}
- 출발일: {request.start_date}
- 도착일: {request.end_date}
- 기간: {request.duration}일
- 예산: {request.budget}만원
- 여행 스타일: {travel_styles_str}
- 동반자: {companion_desc.get(request.companions, request.companions)}
- 관심사: {interests_str}

다음 JSON 형식으로 응답해주세요:
{{
  "totalBudget": {request.budget},
  "overview": "여행 개요 설명",
  "days": [
    {{
      "day": 1,
      "date": "2024-01-01",
      "theme": "첫날 테마",
      "places": [
        {{
          "name": "장소명",
          "description": "장소 설명",
          "category": "카테고리",
          "estimatedTime": 120,
          "tips": "팁"
        }}
      ],
      "totalBudget": 50000,
      "transportation": "교통수단"
    }}
  ],
  "tips": ["여행 팁1", "여행 팁2"]
}}"""
        return prompt

    def _parse_ai_response(self, ai_response: str, request: TripRequest) -> TripPlan:
        try:
            # AI가 반환할 수 있는 ```json ... ``` 마크다운 제거
            clean_response = ai_response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:-3].strip()
            
            data = json.loads(clean_response)
            
            trip_id = str(uuid.uuid4())
            created_at = datetime.now().isoformat()
            
            days = [DayPlan(**day_data) for day_data in data.get('days', [])]
            
            return TripPlan(
                id=trip_id,
                destination=request.destination,
                duration=request.duration,
                totalBudget=data.get('totalBudget', request.budget),
                overview=data.get('overview', f'{request.destination} 여행'),
                days=days,
                tips=data.get('tips', []),
                createdAt=created_at
            )
        except Exception as e:
            print(f"AI 응답 파싱 오류: {e}")
            return self._create_fallback_plan(request)
            
    # ... (_add_coordinates, _create_fallback_plan 함수는 이전과 동일)
    async def _add_coordinates(self, trip_plan: TripPlan, destination: str) -> TripPlan:
        # ... (이전 코드와 동일)
        return trip_plan
    
    def _create_fallback_plan(self, request: TripRequest) -> TripPlan:
        """AI 호출 실패 시 사용할 기본 일정"""
        trip_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        # 기본 장소들 (제주도 예시)
        sample_places = [
            Place(
                name="성산일출봉",
                description="제주도의 대표적인 일출 명소",
                category="자연경관",
                estimatedTime=90,
                tips="일출 시간에 맞춰 방문하세요"
            ),
            Place(
                name="우도",
                description="아름다운 섬 풍경을 감상할 수 있는 곳",
                category="자연경관", 
                estimatedTime=180,
                tips="자전거 대여를 추천합니다"
            ),
            Place(
                name="제주 동문시장",
                description="제주 전통 음식을 맛볼 수 있는 시장",
                category="맛집",
                estimatedTime=120,
                tips="흑돼지 고기와 해산물을 꼭 드세요"
            )
        ]
        
        # 일정별로 장소 배분
        days = []
        places_per_day = len(sample_places) // request.duration
        if places_per_day == 0:
            places_per_day = 1
            
        for day in range(1, request.duration + 1):
            start_idx = (day - 1) * places_per_day
            end_idx = min(start_idx + places_per_day, len(sample_places))
            day_places = sample_places[start_idx:end_idx]
            
            if not day_places and sample_places:  # 마지막 날에 장소가 없으면 첫 번째 장소 추가
                day_places = [sample_places[0]]
            
            # 시작 날짜를 기준으로 날짜 계산
            try:
                start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
                current_date = (start_date + timedelta(days=day-1)).strftime("%Y-%m-%d")
            except:
                current_date = (datetime.now() + timedelta(days=day-1)).strftime("%Y-%m-%d")
            
            # 여행 스타일에 따른 테마 설정
            theme_map = {
                'cultural': '문화 탐방', 'foodie': '미식 여행', 'nature': '자연 감상',
                'active': '액티비티', 'relaxed': '휴양', 'shopping': '쇼핑',
                'nightlife': '나이트라이프', 'wellness': '웰니스', 'photography': '포토 투어',
                'luxury': '럭셔리 투어'
            }
            main_theme = theme_map.get(request.travel_style[0] if request.travel_style else 'relaxed', '자유 여행')
            
            day_plan = DayPlan(
                day=day,
                date=current_date,
                theme=f"{day}일차 - {main_theme}",
                places=day_places,
                totalBudget=request.budget // request.duration,
                transportation="렌터카"
            )
            days.append(day_plan)
        
        return TripPlan(
            id=trip_id,
            destination=request.destination,
            duration=request.duration,
            totalBudget=request.budget,
            overview=f"{request.destination} {request.duration}일 여행 일정",
            days=days,
            tips=[
                "현지 교통편을 미리 확인하세요",
                "날씨에 따른 대체 일정을 준비하세요",
                "현지 맛집 정보를 미리 조사해보세요"
            ],
            createdAt=created_at
        )