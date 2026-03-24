from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import create_tables
from app.api.routes import auth, products, orders, wallet, chat, agent, logistics, community, admin, reference, notifications, upload

# Import all models so Base.metadata knows about them
import app.models.user  # noqa
import app.models.product  # noqa
import app.models.order  # noqa
import app.models.transaction  # noqa
import app.models.agent_farmer  # noqa
import app.models.chat  # noqa
import app.models.community  # noqa
import app.models.notification  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    await create_tables()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(wallet.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(logistics.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reference.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
