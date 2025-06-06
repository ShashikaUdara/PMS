from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import hashlib
from repository import get_session, User, UserSession
from models import UserSignup, GeneralResponse, UserSignin
import uuid
import datetime
from fastapi import APIRouter
from fastapi import Request
import inspect
from auth import validate_token

app = FastAPI()

router = APIRouter(prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.post("/user/signup")
async def signup(user: UserSignup):

    session = get_session()
    existing_user = session.query(User).filter_by(email=user.email, status=1).first()
    if existing_user:
        return GeneralResponse(
            message="User with this email already exists and is active.", 
            status=False,
            code=400,
            data=[]
        )

    hashed_password = hashlib.sha256(user.password.encode('utf-8')).hexdigest()

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        bio='',
        hashed_password=hashed_password,
        email=user.email,
        status=1,
        role=1,
        company=123
    )
    session.add(new_user)
    session.commit()
    
    return GeneralResponse(
        message="User signed up successfully",
        status=True,
        code=201,
        data=[{"user": user}]
    )

@router.post("/user/signin")
async def signin(user: UserSignin):
    session = get_session()
    db_user = session.query(User).filter_by(email=user.email, status=1).first()
    if not db_user:
        return GeneralResponse(
            message="Invalid email or password.",
            status=False,
            code=401,
            data=[]
        )

    hashed_password = hashlib.sha256(user.password.encode('utf-8')).hexdigest()
    if db_user.hashed_password != hashed_password:
        return GeneralResponse(
            message="Invalid email or password.",
            status=False,
            code=401,
            data=[]
        )


    session_token = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    user_session = UserSession(
        user_id=db_user.id,
        session_token=session_token,
        status=1,
        created_at=now,
        expires_at=now + datetime.timedelta(hours=24)
    )
    session.add(user_session)
    session.commit()

    return GeneralResponse(
        message="Signin successful.",
        status=True,
        code=200,
        data={"token": session_token, "user": {
            "id": db_user.id,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "email": db_user.email,
            "bio": db_user.bio,
            "role": db_user.role,
            "company": db_user.company,
            "status": db_user.status
        }}
    )

@router.post("/user/signout")
async def signout():
    frame = inspect.currentframe()
    while frame:
        if "request" in frame.f_locals:
            request = frame.f_locals["request"]
            break
        frame = frame.f_back
    else:
        request = None

    auth_header = None
    if request:
        auth_header = request.headers.get("authorization")
        print(f"Authorization header: {auth_header}")
    else:
        return GeneralResponse(
            message="Invalid token.",
            status=False,
            code=401,
            data=[]
        )
    
    if auth_header is None:
        return GeneralResponse(
            message="Header has no token.",
            status=False,
            code=401,
            data=[]
        )
    
    session = get_session()
    user_session = session.query(UserSession).filter_by(session_token=auth_header[len("Bearer "):], status=1).first()
    if not user_session:
        return GeneralResponse(
            message="Invalid or expired session token.",
            status=False,
            code=401,
            data=[]
        )
    
    # user_session_info = validate_token(request, user_session.session_token)

    user_session.status = 0  # Mark session as inactive
    session.commit()
    return GeneralResponse(
        message="Signout successful.",
        status=True,
        code=200,
        data=[]
    )

app.include_router(router)