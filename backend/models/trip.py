# 파일 경로: models/trip.py

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class TripRequest(BaseModel):
    destination: str
    start_date: str = Field(alias='startDate')  # 출발일 (YYYY-MM-DD)
    end_date: str = Field(alias='endDate')      # 도착일 (YYYY-MM-DD)
    duration: int
    budget: int
    travel_style: List[Literal['active', 'relaxed', 'cultural', 'foodie', 'nature', 'shopping', 'nightlife', 'wellness', 'photography', 'luxury']]
    companions: Literal['solo', 'couple', 'family', 'friends']
    interests: List[str]
    
    class Config:
        allow_population_by_field_name = True

class Coordinates(BaseModel):
    lat: float
    lng: float

class Place(BaseModel):
    name: str
    description: str
    category: str
    estimated_time: int = Field(alias='estimatedTime')
    coordinates: Optional[Coordinates] = None
    tips: Optional[str] = None
    recommended_menu: Optional[List[str]] = Field(default=None, alias='recommendedMenu')  # 추천 메뉴/활동
    estimated_cost: Optional[str] = Field(default=None, alias='estimatedCost')  # 예상 비용
    nearby_places: Optional[List[str]] = Field(default=None, alias='nearbyPlaces')  # 주변 정보
    image_url: Optional[str] = Field(default=None, alias='imageUrl')  # 이미지 URL
    
    class Config:
        allow_population_by_field_name = True

class DayPlan(BaseModel):
    day: int
    date: str
    theme: str
    places: List[Place]
    total_budget: int = Field(alias='totalBudget')
    transportation: str

    class Config:
        allow_population_by_field_name = True

class TripPlan(BaseModel):
    id: str
    destination: str
    duration: int
    total_budget: int = Field(alias='totalBudget')
    overview: str
    days: List[DayPlan]
    tips: List[str]
    created_at: str = Field(alias='createdAt')

    class Config:
        allow_population_by_field_name = True

class TripPlanDB(BaseModel):
    id: str
    destination: str
    duration: int
    total_budget: int
    overview: str
    plan_data: dict
    created_at: datetime