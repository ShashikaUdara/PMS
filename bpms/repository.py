from sqlalchemy import create_engine, Column, Integer, String, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from sqlalchemy import ForeignKey

Base = declarative_base()

from sqlalchemy import (
    Column, Integer, String, SmallInteger, Boolean, DateTime, Index, CheckConstraint
)

SCHEMA_NAME = 'public'  # Adjust as needed

class User(Base):
    __tablename__ = 'users'
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_status', 'status'),
        Index('idx_user_role', 'role'),
        Index('idx_user_company', 'company'),
        Index('idx_user_created_at', 'created_at'),
        Index('idx_user_updated_at', 'updated_at'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    bio = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    status = Column(SmallInteger, nullable=True)
    role = Column(SmallInteger, nullable=True)
    company = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Company(Base):
    __tablename__ = 'companies'
    __table_args__ = (
        Index('idx_company_name', 'name'),
        Index('idx_company_email', 'email'),
        {'schema': SCHEMA_NAME},
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class ApplicationStatus(Base):
    __tablename__ = 'application_status'
    __table_args__ = (
        Index('idx_status_name', 'name'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, nullable=True)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class UserSession(Base):
    __tablename__ = 'user_sessions'
    __table_args__ = (
        Index('idx_user_session_user_id', 'user_id'),
        Index('idx_user_session_token', 'session_token'),
        {'schema': SCHEMA_NAME},
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

engine = create_engine('postgresql://postgres:postgres@bpms_repo:5432/bpmsdb')
Session = sessionmaker(bind=engine)
session = Session()

def get_session():
    Base.metadata.create_all(engine)
    return Session()

# Complex query with joins/filters
# from sqlalchemy import and_

# users = session.query(User).filter(
#     and_(
#         User.first_name.like('%John%'),
#         User.last_name.like('%Doe%')
#     )
# ).all()

# new_user = User(
#     first_name='John',
#     last_name='Doe',
#     bio='Sample bio',
#     hashed_password='hashed_password_here',
#     email='john.doe@example.com',
#     status=1,
#     role=2,
#     company=123
# )
# session.add(new_user)
# session.commit()