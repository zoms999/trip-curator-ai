import os
from supabase import create_client, Client
from typing import List, Optional
from datetime import datetime
import json

from models.trip import TripPlan, TripPlanDB

class DatabaseService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None
            print("Supabase 설정이 없습니다. 메모리에서만 동작합니다.")
        
        # 메모리 저장소 (Supabase 없을 때 사용)
        self.memory_storage: List[TripPlan] = []
    
    async def save_trip_plan(self, trip_plan: TripPlan) -> bool:
        """여행 일정 저장"""
        try:
            if self.supabase:
                # Supabase에 저장
                trip_db = TripPlanDB(
                    id=trip_plan.id,
                    destination=trip_plan.destination,
                    duration=trip_plan.duration,
                    total_budget=trip_plan.total_budget,
                    overview=trip_plan.overview,
                    plan_data=trip_plan.dict(),
                    created_at=datetime.fromisoformat(trip_plan.created_at)
                )
                
                result = self.supabase.table('trip_plans').insert(trip_db.dict()).execute()
                return len(result.data) > 0
            else:
                # 메모리에 저장
                self.memory_storage.append(trip_plan)
                return True
                
        except Exception as e:
            print(f"여행 일정 저장 오류: {e}")
            # Supabase 실패 시 메모리에 저장
            self.memory_storage.append(trip_plan)
            return True
    
    async def get_trip_plan(self, trip_id: str) -> Optional[TripPlan]:
        """여행 일정 조회"""
        try:
            if self.supabase:
                result = self.supabase.table('trip_plans').select('*').eq('id', trip_id).execute()
                
                if result.data:
                    trip_data = result.data[0]
                    return TripPlan(**trip_data['plan_data'])
            
            # 메모리에서 검색
            for trip in self.memory_storage:
                if trip.id == trip_id:
                    return trip
            
            return None
            
        except Exception as e:
            print(f"여행 일정 조회 오류: {e}")
            # 메모리에서 검색
            for trip in self.memory_storage:
                if trip.id == trip_id:
                    return trip
            return None
    
    async def list_trip_plans(self, limit: int = 10, offset: int = 0) -> List[TripPlan]:
        """여행 일정 목록 조회"""
        try:
            if self.supabase:
                result = self.supabase.table('trip_plans')\
                    .select('*')\
                    .order('created_at', desc=True)\
                    .range(offset, offset + limit - 1)\
                    .execute()
                
                trips = []
                for trip_data in result.data:
                    trips.append(TripPlan(**trip_data['plan_data']))
                
                return trips
            else:
                # 메모리에서 반환
                return self.memory_storage[offset:offset + limit]
                
        except Exception as e:
            print(f"여행 일정 목록 조회 오류: {e}")
            return self.memory_storage[offset:offset + limit]
    
    async def create_tables(self):
        """데이터베이스 테이블 생성 (초기 설정용)"""
        if not self.supabase:
            return
        
        # Supabase에서는 SQL로 테이블 생성
        create_table_sql = """
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
        """
        
        try:
            # Supabase에서는 대시보드에서 직접 SQL 실행 필요
            print("Supabase 대시보드에서 다음 SQL을 실행하세요:")
            print(create_table_sql)
        except Exception as e:
            print(f"테이블 생성 오류: {e}")