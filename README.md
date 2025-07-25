# 🧳 코스짜요AI (Trip Curator AI)

AI 기반 개인 맞춤형 여행 일정 자동 추천 및 최적화 서비스

## ✨ 주요 특징

- **개인 맞춤형 일정**: 취향, 예산, 동반자 유형을 고려한 AI 추천
- **스토리텔링 일정**: 단순 나열이 아닌 테마가 있는 일정 구성
- **실시간 지도 연동**: Google Maps를 통한 장소 위치 및 경로 표시
- **일정 저장 및 공유**: 생성된 일정을 저장하고 공유 가능
- **반응형 디자인**: 웹과 모바일에서 모두 최적화

## 🛠 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Google Maps API** - 지도 연동

### Backend
- **FastAPI** - Python 웹 프레임워크
- **Google Gemini Pro** - AI 일정 생성
- **Supabase** - 데이터베이스
- **Google Maps API** - 장소 정보

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd trip-curator-ai
```

### 2. 환경 설정
```bash
# 백엔드 환경 변수
cd backend
cp .env.example .env
# .env 파일에 API 키 입력

# 프론트엔드 환경 변수
cd ../frontend
cp .env.example .env.local
# .env.local 파일에 API 키 입력
```

### 3. 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 4. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 5. 브라우저에서 확인
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📋 필수 API 키

1. **Google Gemini API Key**: https://ai.google.dev/gemini-api/docs/quickstart
2. **Supabase**: https://supabase.com (Database URL + anon key)
3. **Google Maps API**: https://console.cloud.google.com

자세한 설정 방법은 [docs/setup.md](docs/setup.md)를 참고하세요.

## 📁 프로젝트 구조

```
trip-curator-ai/
├── frontend/              # Next.js 프론트엔드
│   ├── app/
│   │   ├── components/    # React 컴포넌트
│   │   ├── types/         # TypeScript 타입
│   │   └── page.tsx       # 메인 페이지
│   └── package.json
├── backend/               # FastAPI 백엔드
│   ├── models/           # 데이터 모델
│   ├── services/         # 비즈니스 로직
│   ├── main.py          # API 서버
│   └── requirements.txt
└── docs/                 # 문서
```

## 🎯 주요 기능

### MVP 기능
- [x] 여행 조건 입력 폼
- [x] AI 기반 일정 생성
- [x] 지도 연동 장소 표시
- [x] 일정 저장 및 공유
- [x] 반응형 UI/UX

### 향후 계획
- [ ] 사용자 인증 시스템
- [ ] 결제 시스템 (일정 생성 과금)
- [ ] 프리미엄 구독 모델
- [ ] 실시간 날씨/이벤트 반영
- [ ] 제휴 마케팅 (숙소/액티비티 예약)

## 💰 수익 모델

1. **일정 생성 과금**: 1회 3,000-5,000원
2. **프리미엄 구독**: 월/연 구독으로 무제한 생성
3. **제휴 마케팅**: Booking.com, Klook 등 예약 수수료

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for travelers who want personalized experiences**