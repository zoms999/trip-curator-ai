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
from models.trip import TripRequest, TripPlan

load_dotenv()

app = FastAPI(title="Trip Curator AI API", version="1.0.0")

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
        # AI로 여행 일정 생성
        trip_plan = await trip_generator.generate_trip_plan(request)
        
        # 데이터베이스에 저장
        await db_service.save_trip_plan(trip_plan)
        
        return trip_plan
    except Exception as e:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)