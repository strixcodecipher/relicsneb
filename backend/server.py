from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Nebula Relics Tracker API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class SpawnData(BaseModel):
    location: str
    type: str
    color_set: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SpawnPrediction(BaseModel):
    current_spawns: List[Dict[str, Any]]
    next_spawns: List[Dict[str, Any]]
    time_to_next: int
    current_color_set: str
    server_time: datetime

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Nebula Relics Tracker API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    
    # Prepare data for MongoDB storage
    status_data = status_obj.dict()
    if isinstance(status_data.get('timestamp'), datetime):
        status_data['timestamp'] = status_data['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(status_data)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    
    # Parse datetime strings back to datetime objects
    for status_check in status_checks:
        if isinstance(status_check.get('timestamp'), str):
            status_check['timestamp'] = datetime.fromisoformat(status_check['timestamp'])
    
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/spawn-prediction", response_model=SpawnPrediction)
async def get_spawn_prediction():
    """
    Get current and predicted spawn information for Nebula Relics.
    This endpoint provides real-time spawn tracking data.
    """
    current_time = datetime.now(timezone.utc)
    
    # This is a simplified response - the main logic is handled on the frontend
    # for real-time updates. This endpoint could be extended for server-side 
    # calculations if needed.
    
    return SpawnPrediction(
        current_spawns=[],
        next_spawns=[],
        time_to_next=0,
        current_color_set="blue",
        server_time=current_time
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()