# API 문서

## Base URL
- 개발: `http://localhost:8000`
- 프로덕션: `https://your-backend-url.com`

## 엔드포인트

### 1. 여행 일정 생성
```http
POST /api/generate-trip
```

**Request Body:**
```json
{
  "destination": "제주도",
  "duration": 3,
  "budget": 50,
  "travel_style": "relaxed",
  "companions": "couple",
  "interests": ["맛집", "카페", "자연경관"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "destination": "제주도",
  "duration": 3,
  "total_budget": 50,
  "overview": "제주도 3일 여행 일정...",
  "days": [
    {
      "day": 1,
      "date": "2024-01-01",
      "theme": "제주 서부 탐방",
      "places": [
        {
          "name": "한라산",
          "description": "제주도의 상징적인 산",
          "category": "자연경관",
          "estimated_time": 180,
          "coordinates": {
            "lat": 33.3617,
            "lng": 126.5292
          },
          "tips": "등산화 필수"
        }
      ],
      "total_budget": 17,
      "transportation": "렌터카 이용"
    }
  ],
  "tips": ["날씨 확인", "렌터카 예약"],
  "created_at": "2024-01-01T00:00:00"
}
```

### 2. 여행 일정 조회
```http
GET /api/trips/{trip_id}
```

### 3. 여행 일정 목록
```http
GET /api/trips?limit=10&offset=0
```

### 4. 헬스 체크
```http
GET /health
```

## 에러 응답

```json
{
  "detail": "에러 메시지"
}
```

## 상태 코드
- 200: 성공
- 400: 잘못된 요청
- 404: 리소스 없음
- 500: 서버 오류