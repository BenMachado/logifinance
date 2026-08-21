"""v1 API router aggregator."""
from fastapi import APIRouter

from app.api.v1 import (
    alerts,
    auth,
    companies,
    costs,
    dashboard,
    drivers,
    maintenance,
    receipts,
    trips,
    vehicles,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(drivers.router)
api_router.include_router(vehicles.router)
api_router.include_router(trips.router)
api_router.include_router(costs.router)
api_router.include_router(receipts.router)
api_router.include_router(maintenance.router)
api_router.include_router(alerts.router)
api_router.include_router(dashboard.router)
