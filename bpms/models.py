from pydantic import BaseModel, EmailStr

class GeneralResponse(BaseModel):
    status: bool
    message: str
    code: int
    data: object

class UserSignup(BaseModel):
    first_name: str
    last_name: str
    company: str
    email: str
    password: str
    phone: str
    role: str

class UserSignin(BaseModel):
    email: str
    password: str