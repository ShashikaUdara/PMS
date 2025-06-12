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
    name: str
    description: str = None
    status: int = 1
    team_id: Optional[int] = None
    boq_id: Optional[int] = None
    tags: List[str] = []

    class Config:
        from_attributes = True

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

class TaskImportResponse(BaseModel):
    total_rows: int
    imported_rows: int
    failed_rows: int
    errors: List[str]

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: str = None
    priority: int
    status: int
    start_date: datetime = None
    end_date: datetime = None
    assigned_to: int = None
    estimated_hours: int = None
    actual_hours: int = None
    parent_task_id: int = None
    tags: List[int] = None

    class Config:
        from_attributes = True