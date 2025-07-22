# 트립 큐레이터 AI 설정 가이드

## 1. 환경 설정

### 필수 API 키 발급

1. **OpenAI API Key**
   - https://platform.openai.com/api-keys 에서 발급
   - GPT-4 사용 권한 필요

2. **Supabase 설정**
   - https://supabase.com 에서 프로젝트 생성
   - Database URL과 anon key 복사

3. **Google Maps API Key**
   - https://console.cloud.google.com 에서 발급
   - Maps JavaScript API, Places API 활성화

### 환경 변수 설정

**백엔드 (.env)**
```bash
cd backend
cp .env.example .env
# .env 파일에 실제 API 키 입력
```

**프론트엔드 (.env.local)**
```bash
cd frontend
cp .env.example .env.local
# .env.local 파일에 실제 API 키 입력
```

## 2. 데이터베이스 설정

Supabase 대시보드에서 다음 SQL 실행:

```sql
CREATE TABLE IF NOT EXISTS trip_plans (
    id UUID PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    total_budget INTEGER NOT NULL,
    overview TEXT,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_plans_destination ON trip_plans(destination);
CREATE INDEX IF NOT EXISTS idx_trip_plans_created_at ON trip_plans(created_at);
```

## 3. 개발 서버 실행

### 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

## 4. 배포

### Vercel (프론트엔드)
1. GitHub 연결
2. 환경 변수 설정
3. 자동 배포

### Render (백엔드)
1. GitHub 연결
2. Python 환경 선택
3. 환경 변수 설정
4. 자동 배포

## 5. 수익 모델 구현

### 결제 시스템 (추후 구현)
- Stripe 또는 토스페이먼츠 연동
- 일정 생성당 과금 시스템
- 프리미엄 구독 모델

### 제휴 마케팅
- Booking.com API 연동
- Klook API 연동
- 추천 링크를 통한 수수료 수익