from sqlalchemy import create_engine, Column, Integer, String, and_, UniqueConstraint, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY

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

class Team(Base):
    __tablename__ = 'teams'
    __table_args__ = (
        Index('idx_team_name', 'name'),
        Index('idx_team_status', 'status'),
        UniqueConstraint('team_index', name='uq_team_index'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    team_index = Column(Integer, nullable=False, unique=True)
    company_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.companies.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class ProjectBoq(Base):
    __tablename__ = 'project_boqs'
    __table_args__ = (
        Index('idx_boq_name', 'name'),
        Index('idx_boq_status', 'status'),
        UniqueConstraint('boq_index', name='uq_boq_index'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    boq_index = Column(Integer, nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    company_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.companies.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class BoqInfo(Base):
    __tablename__ = 'boq_info'
    __table_args__ = (
        Index('idx_boq_info_boq_id', 'boq_id'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    boq_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_boqs.id'), nullable=False)
    info_key = Column(String(255), nullable=False)
    info_value = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class ProjectActivity(Base):
    __tablename__ = 'project_activities'
    __table_args__ = (
        Index('idx_project_activity_project_id', 'project_id'),
        Index('idx_project_activity_status', 'status'),
        UniqueConstraint('activity_index', name='uq_activity_index'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.projects.id'), nullable=False)
    activity_index = Column(Integer, nullable=False, unique=True)
    activity = Column(Integer, nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class Tag(Base):
    __tablename__ = 'tags'
    __table_args__ = (
        Index('idx_tag_name', 'name'),
        Index('idx_tag_status', 'status'),
        UniqueConstraint('tag_index', name='uq_tag_index'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    tag_index = Column(Integer, nullable=False, unique=True)
    tag_type = Column(Integer, nullable=False)
    tag_value = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)

class Project(Base):
    __tablename__ = 'projects'
    __table_args__ = (
        Index('idx_project_name', 'name'),
        Index('idx_project_status', 'status'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_index = Column(Integer, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    company_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.companies.id'), nullable=True)
    team_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.teams.id'), nullable=True)
    boq_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_boqs.id'), nullable=True)
    activity_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_activities.id'), nullable=True)
    tag_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.tags.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)


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



# def insert_default_team():
#     session = get_session()
#     try:
#         # Check if default team already exists
#         existing_team = session.query(Team).filter(Team.name == 'Default Team').first()
#         if existing_team:
#             return existing_team

#         # Get the next available team_index
#         max_index = session.query(Team.team_index).order_by(Team.team_index.desc()).first()
#         next_index = 1 if max_index is None else max_index[0] + 1

#         # Create default team
#         default_team = Team(
#             team_index=next_index,
#             company_id=1,  # Assuming company_id 1 exists
#             name='Default Team',
#             description='Default team for the system',
#             status=1  # Assuming 1 means active
#         )
        
#         session.add(default_team)
#         session.commit()
#         return default_team
#     except Exception as e:
#         session.rollback()
#         raise e
#     finally:
#         session.close()

# def insert_default_company():
#     session = get_session()
#     try:
#         # Check if default company already exists
#         existing_company = session.query(Company).filter(Company.name == 'Default Company').first()
#         if existing_company:
#             return existing_company

#         # Create default company
#         default_company = Company(
#             name='Default Company',
#             description='Default company for the system',
#             phone='0000000000',
#             email='default@company.com',
#             status=1  # Assuming 1 means active
#         )
        
#         session.add(default_company)
#         session.commit()
#         return default_company
#     except Exception as e:
#         session.rollback()
#         raise e
#     finally:
#         session.close()

# def insert_default_user():
#     session = get_session()
#     try:
#         # Check if default user already exists
#         existing_user = session.query(User).filter(User.email == 'admin@system.com').first()
#         if existing_user:
#             return existing_user

#         # Create default admin user
#         default_user = User(
#             first_name='System',
#             last_name='Admin',
#             email='admin@system.com',
#             hashed_password='default_hashed_password',  # This should be properly hashed in production
#             status=1,  # Active
#             role=1,    # Admin
#         )
        
#         session.add(default_user)
#         session.commit()
#         return default_user
#     except Exception as e:
#         session.rollback()
#         raise e
#     finally:
#         session.close()

def insert_project_activity(project_id, current_user):
    session = get_session()
    try:
        # Get the next available activity_index
        max_index = session.query(ProjectActivity.activity_index).order_by(ProjectActivity.activity_index.desc()).first()
        next_index = 1 if max_index is None else max_index[0] + 1

        print(f"Creating activity with project_id: {project_id}, user_id: {current_user.id}, index: {next_index}")

        # Create default project activity
        default_activity = ProjectActivity(
            project_id=project_id,
            activity_index=next_index,
            activity=1,    # Default activity type
            description='Default project activity',
            status=1,      # Active
            created_by=current_user.id,
            updated_by=current_user.id
        )
        
        session.add(default_activity)
        session.commit()
        print(f"Activity created with ID: {default_activity.id}")

        # Update the project with the activity ID
        project = session.query(Project).filter(Project.id == project_id).first()
        if project:
            project.activity_id = default_activity.id
            session.commit()
            print(f"Project {project_id} updated with activity_id: {default_activity.id}")
        else:
            print(f"Warning: Project {project_id} not found for activity update")

        return default_activity.id
    except Exception as e:
        print(f"Error in insert_project_activity: {str(e)}")
        session.rollback()
        raise e
    finally:
        session.close()

# Create default records
# if __name__ == '__main__':
    # default_user = insert_default_user()
    # default_company = insert_default_company()
    # default_team = insert_default_team()
    # default_activity = insert_default_project_activity()

engine = create_engine('postgresql://postgres:postgres@bpms_repo:5432/bpmsdb')
with engine.connect() as connection:
    connection.execute(text('CREATE SCHEMA IF NOT EXISTS public'))
    connection.commit()
Session = sessionmaker(bind=engine)
session = Session()

def get_session():
    Base.metadata.create_all(engine)
    return Session()