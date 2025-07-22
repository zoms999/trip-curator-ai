from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class TripRequest(BaseModel):
    destination: str
    duration: int  # 일 수
    budget: int  # 예산 (만원)
    travel_style: Literal['active', 'relaxed', 'cultural', 'foodie', 'nature']
    companions: Literal['solo', 'couple', 'family', 'friends']
    interests: List[str]  # 관심사 키워드

class Coordinates(BaseModel):
    lat: float
    lng: float

class Place(BaseModel):
    name: str
    description: str
    category: str
    estimated_time: int  # 분
    coordinates: Optional[Coordinates] = None
    tips: Optional[str] = None

class DayPlan(BaseModel):
    day: int
    date: str
    theme: str
    places: List[Place]
    total_budget: int
    transportation: str

class TripPlan(BaseModel):
    id: str
    destination: str
    duration: int
    total_budget: int
    overview: str
    days: List[DayPlan]
    tips: List[str]
    created_at: str

class TripPlanDB(BaseModel):
    """데이터베이스 저장용 모델"""
    id: str
    destination: str
    duration: int
    total_budget: int
    overview: str
    plan_data: dict  # JSON으로 저장될 전체 일정 데이터
    created_at: datetime