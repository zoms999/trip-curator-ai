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