from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional, Any, List
from datetime import datetime

class GeneralResponse(BaseModel):
    status: bool
    message: str
    code: int
    data: Any

class UserBase(BaseModel):
    email: EmailStr
    first_name: constr(min_length=1, max_length=255)
    last_name: constr(min_length=1, max_length=255)

class UserSignup(UserBase):
    password: constr(min_length=8)
    # company: int
    # phone: constr(pattern=r'^\+?1?\d{9,15}$')
    # role: int = Field(ge=1, le=3)  # 1: Admin, 2: Manager, 3: User
    bio: Optional[str] = None

class UserSignin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime

class UserResponse(UserBase):
    id: int
    bio: Optional[str]
    role: int
    company: int
    status: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: constr(min_length=1, max_length=255)
    description: Optional[str] = None
    team_id: Optional[int] = None
    boq_id: Optional[int] = None
    activity_id: Optional[int] = None
    tag_id: Optional[int] = None
    status: int = Field(default=1)  # 1: Active, 0: Inactive

    class Config:
        json_schema_extra = {
            "example": {
                "name": "New Office Building Project",
                "description": "Construction of a new 10-story office building",
                "team_id": 1,
                "boq_id": 1,
                "activity_id": 1,
                "tag_id": 1,
                "status": 1
            }
        }

class ProjectResponse(BaseModel):
    id: int
    project_index: int
    name: str
    description: Optional[str]
    status: int
    # company_id: int
    # team_id: int
    # boq_id: int
    # activity_id: int
    # tag_id: int
    created_at: datetime
    created_by: int
    updated_at: datetime
    updated_by: Optional[int]

    class Config:
        from_attributes = True