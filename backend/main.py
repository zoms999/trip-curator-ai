from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import json

from services.trip_generator import TripGenerator
from services.database import DatabaseService
from models.trip import TripRequest, TripPlan, TripPlanDB

load_dotenv()

app = FastAPI(title="Trip Curator AI API", version="1.0.0")

# JSON 응답에서 한글 깨짐 방지
import json
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

class UnicodeJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            jsonable_encoder(content),
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

app.default_response_class = UnicodeJSONResponse

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 초기화
trip_generator = TripGenerator()
db_service = DatabaseService()

@app.get("/")
async def root():
    return {"message": "Trip Curator AI API is running!"}

@app.post("/api/generate-trip", response_model=TripPlan)
async def generate_trip(request: TripRequest):
    """AI 기반 여행 일정 생성"""
    try:
        print(f"받은 요청:\n{request.model_dump_json(indent=2)}")
        
        # AI로 여행 일정 생성
        trip_plan = await trip_generator.generate_trip_plan(request)
        print(f"생성된 일정: {trip_plan.id}")
        
        # 데이터베이스에 저장
        await db_service.save_trip_plan(trip_plan)
        print("데이터베이스 저장 완료")
        
        return trip_plan
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"일정 생성 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/trips/{trip_id}", response_model=TripPlan)
async def get_trip(trip_id: str):
    """저장된 여행 일정 조회"""
    try:
        trip_plan = await db_service.get_trip_plan(trip_id)
        if not trip_plan:
            raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
        return trip_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일정 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/trips")
async def list_trips(limit: int = 10, offset: int = 0):
    """여행 일정 목록 조회"""
    try:
        trips = await db_service.list_trip_plans(limit=limit, offset=offset)
        return {"trips": trips, "total": len(trips)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일정 목록 조회 중 오류가 발생했습니다: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/test-trip")
async def test_trip(request: TripRequest):
    """테스트용 간단한 일정 생성"""
    try:
        print(f"테스트 요청: {request}")
        
        # 간단한 테스트 일정 생성 (AI 없이)
        trip_plan = trip_generator._create_fallback_plan(request)
        print(f"테스트 일정 생성 완료: {trip_plan.id}")
        
        return trip_plan
    except Exception as e:
        print(f"테스트 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"테스트 오류: {str(e)}")

@app.get("/api/test-gemini")
async def test_gemini():
    """Gemini API 연결 테스트"""
    try:
        import google.generativeai as genai
        
        # API 키 확인
        api_key = os.getenv("GEMINI_API_KEY", "AIzaSyCuWV_W0spaeTeK2mwIiFOOG0y53u_ycY4")
        print(f"API 키: {api_key[:10]}...")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # 간단한 테스트 요청
        response = model.generate_content("안녕하세요! 간단한 테스트입니다.")
        
        return {
            "status": "success",
            "response": response.text[:100] + "..." if len(response.text) > 100 else response.text
        }
    except Exception as e:
        print(f"Gemini 테스트 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)