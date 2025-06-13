from sqlalchemy import create_engine, Column, Integer, String, and_, UniqueConstraint, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text
from utils import get_password_hash

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

class ConstructionStandardType(Base):
    __tablename__ = 'construction_standard_types'
    __table_args__ = (
        Index('idx_construction_standard_type_name', 'name'),
        Index('idx_construction_standard_type_status', 'status'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)

class ConstructionStandard(Base):
    __tablename__ = 'construction_standards'
    __table_args__ = (
        Index('idx_construction_standard_item_name', 'name'),
        Index('idx_construction_standard_item_status', 'status'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    standard_type_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.construction_standard_types.id'), nullable=False)
    standard_code = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    regions = Column(ARRAY(String(255)), nullable=True)
    units = Column(ARRAY(String(255)), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)

class UnitAndMeasurement(Base):
    __tablename__ = 'unit_and_measurements'
    __table_args__ = (
        Index('idx_unit_and_measurement_name', 'name'),
        Index('idx_unit_and_measurement_status', 'status'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    unit_code = Column(String(255), nullable=False)
    unit_representation = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    region = Column(String(255), nullable=True)
    status = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    description = Column(Text, nullable=True)
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

class ProjectTask(Base):
    __tablename__ = 'project_tasks'
    __table_args__ = (
        Index('idx_project_task_project_id', 'project_id'),
        Index('idx_project_task_status', 'status'),
        Index('idx_project_task_assigned_to', 'assigned_to'),
        Index('idx_project_task_due_date', 'due_date'),
        # UniqueConstraint('task_index', name='uq_task_index'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_index = Column(Integer, nullable=False)
    project_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.projects.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(SmallInteger, nullable=False, default=1)  # 1=Low, 2=Medium, 3=High
    status = Column(SmallInteger, nullable=False, default=1)    # 1=Todo, 2=InProgress, 3=Done, 4=Blocked
    assigned_to = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=True)
    estimated_hours = Column(Integer, nullable=True)
    actual_hours = Column(Integer, nullable=True)
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    parent_task_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_tasks.id'), nullable=True)  # For subtasks
    tags = Column(ARRAY(Integer), nullable=True)  # Array of tag IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)

class TaskActivity(Base):
    __tablename__ = 'task_activities'
    __table_args__ = (
        Index('idx_task_activity_task_id', 'task_id'),
        Index('idx_task_activity_status', 'status'),
        {'schema': SCHEMA_NAME},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_tasks.id'), nullable=False)
    activity_index = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SmallInteger, nullable=True)
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    tags = Column(ARRAY(Integer), nullable=True)  # Array of tag IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.users.id'), nullable=False)

class TaskSubActivity(Base):
    __tablename__ = 'task_sub_activities'
    __table_args__ = (
        Index('idx_task_sub_activity_task_id', 'task_id'),
        Index('idx_task_sub_activity_status', 'status'),
        {'schema': SCHEMA_NAME},
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.project_tasks.id'), nullable=False)
    activity_id = Column(Integer, ForeignKey(f'{SCHEMA_NAME}.task_activities.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SmallInteger, nullable=True)
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    tags = Column(ARRAY(Integer), nullable=True)  # Array of tag IDs
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

def insert_default_units_and_measurements():
    session = get_session()
    try:
        # Check if units already exist
        existing_units = session.query(UnitAndMeasurement).count()
        if existing_units > 0:
            print("Units and measurements already exist, skipping insertion")
            return

        # Define the units and measurements
        units = [
            ("m", "Meter", "Linear measurement (length, width, height)", "Global (SI Unit)"),
            ("m²", "Square Meter", "Area measurement (floors, walls, paving)", "Global (SI Unit)"),
            ("m³", "Cubic Meter", "Volume measurement (concrete, earthwork)", "Global (SI Unit)"),
            ("kg", "Kilogram", "Weight measurement (steel, materials)", "Global (SI Unit)"),
            ("No.", "Number", "Count of items (doors, windows, fixtures)", "Global"),
            ("Lump Sum (LS)", "Lump Sum", "Fixed price for a defined scope", "Global (Contracts)"),
            ("t", "Tonne (Metric Ton)", "1000 kg (bulk materials, aggregates)", "Global (SI Unit)"),
            ("km", "Kilometer", "Long-distance measurement (roads, pipelines)", "Global (SI Unit)"),
            ("mm", "Millimeter", "Small-scale dimensions (tolerances, joints)", "Global (SI Unit)"),
            ("ha", "Hectare", "Large land area (10,000 m²)", "Global (Land Surveying)"),
            ("l", "Liter", "Liquid volume (paint, water, fuel)", "Global (SI Unit)"),
            ("hr", "Hour", "Labor/equipment time", "Global"),
            ("day", "Day", "Equipment rental or labor shifts", "Global"),
            ("ton (US)", "Short Ton (2000 lbs)", "US customary weight", "USA"),
            ("ft", "Foot", "Linear measurement (US/UK)", "USA, UK"),
            ("ft²", "Square Foot", "Area (US/UK flooring, roofing)", "USA, UK"),
            ("ft³", "Cubic Foot", "Volume (US/UK earthwork)", "USA, UK"),
            ("in", "Inch", "Small measurements (US pipes, thickness)", "USA"),
            ("yd", "Yard", "3 ft (US/UK landscaping)", "USA, UK"),
            ("yd²", "Square Yard", "Area (carpet, turfing)", "USA, UK"),
            ("yd³", "Cubic Yard", "Volume (concrete, soil)", "USA, UK"),
            ("gal (US)", "US Gallon", "Liquid volume (3.785 liters)", "USA"),
            ("gal (UK)", "Imperial Gallon", "Liquid volume (4.546 liters)", "UK"),
            ("lb", "Pound", "Weight (US structural steel)", "USA"),
            ("psi", "Pounds per Square Inch", "Pressure (concrete testing)", "USA"),
            ("pcf", "Pounds per Cubic Foot", "Density (soil, concrete)", "USA"),
            ("sf", "Square Foot (Same as ft²)", "Alternative notation", "USA, UK"),
            ("cy", "Cubic Yard (Same as yd³)", "Alternative notation", "USA, UK"),
            ("lf", "Linear Foot", "Length (US piping, trim)", "USA"),
            ("sm", "Square Meter (Same as m²)", "Alternative notation", "Global"),
            ("cm", "Centimeter", "Small measurements (10 mm)", "Global (SI Unit)"),
            ("cm²", "Square Centimeter", "Small areas (tile joints)", "Global (SI Unit)"),
            ("cm³", "Cubic Centimeter", "Small volumes (material testing)", "Global (SI Unit)"),
            ("ml", "Milliliter", "Small liquid volumes (adhesives)", "Global (SI Unit)"),
            ("kN", "Kilonewton", "Force (structural loads)", "Global (Engineering)"),
            ("kPa", "Kilopascal", "Pressure (soil bearing capacity)", "Global (SI Unit)"),
            ("MPa", "Megapascal", "Concrete strength (e.g., C25/30 = 25 MPa)", "Global (SI Unit)"),
            ("GPa", "Gigapascal", "Steel elasticity modulus", "Global (Engineering)"),
            ("A", "Ampere", "Electrical current", "Global (SI Unit)"),
            ("V", "Volt", "Electrical voltage", "Global (SI Unit)"),
            ("W", "Watt", "Power (electrical fixtures)", "Global (SI Unit)"),
            ("kWh", "Kilowatt-hour", "Energy consumption", "Global (SI Unit)"),
            ("dB", "Decibel", "Noise levels (acoustic insulation)", "Global"),
            ("°C", "Degree Celsius", "Temperature (concrete curing)", "Global (SI Unit)"),
            ("°F", "Degree Fahrenheit", "Temperature (US HVAC)", "USA"),
            ("lux", "Lux", "Light intensity (lighting design)", "Global (SI Unit)"),
            ("lm", "Lumen", "Light output (fixtures)", "Global (SI Unit)"),
            ("Hz", "Hertz", "Frequency (vibration testing)", "Global (SI Unit)"),
            ("rpm", "Revolutions per Minute", "Equipment speed (pumps, motors)", "Global"),
            ("Pa·s", "Pascal-second", "Viscosity (bitumen, adhesives)", "Global (SI Unit)"),
            ("Bq", "Becquerel", "Radiation (rare in construction)", "Global (SI Unit)"),
            ("mol", "Mole", "Chemical quantity (material science)", "Global (SI Unit)"),
            ("pH", "pH Value", "Acidity/alkalinity (soil, water)", "Global"),
            ("%", "Percent", "Ratios (slopes, material mixes)", "Global"),
            ("°\"", "Degree-Minute-Second", "Angles (surveying)", "Global")
        ]

        # Insert each unit
        for unit_code, name, description, region in units:
            new_unit = UnitAndMeasurement(
                unit_code=unit_code,
                unit_representation=unit_code,
                name=name,
                description=description,
                region=region,
                status=1
            )
            session.add(new_unit)

        session.commit()
        print(f"Successfully inserted {len(units)} units and measurements")
    except Exception as e:
        session.rollback()
        print(f"Error inserting units and measurements: {str(e)}")
        raise e
    finally:
        session.close()

def insert_default_admin_user():
    session = get_session()
    try:
        # Check if admin user already exists
        existing_user = session.query(User).filter(User.email == 'admin@system.com').first()
        if existing_user:
            print("Default admin user already exists")
            return existing_user.id

        # Create default admin user
        hashed_password = get_password_hash("admin123")  # Default password
        admin_user = User(
            first_name='System',
            last_name='Admin',
            email='admin@system.com',
            hashed_password=hashed_password,
            status=1,  # Active
            role=1,    # Admin
            company=1  # Default company
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        print("Default admin user created successfully")
        return admin_user.id
    except Exception as e:
        session.rollback()
        print(f"Error creating default admin user: {str(e)}")
        raise e
    finally:
        session.close()

def insert_default_construction_standard_types(admin_user_id):
    session = get_session()
    try:
        # Check if standard types already exist
        existing_types = session.query(ConstructionStandardType).count()
        if existing_types > 0:
            print("Construction standard types already exist, skipping insertion")
            return

        # Define the standard types
        standard_types = [
            (1, "International", "International & Widely Used Standards"),
            (2, "Regional", "Regional & Country-Specific Standards"),
            (3, "Specialized", "Specialized Standards"),
            (4, "Digital", "Digital/BIM-Based Standards")
        ]

        # Insert each standard type
        for type_id, name, description in standard_types:
            new_type = ConstructionStandardType(
                id=type_id,  # Explicitly set the ID
                name=name,
                description=description,
                status=1,
                created_by=admin_user_id,
                updated_by=admin_user_id
            )
            session.add(new_type)

        session.commit()
        print(f"Successfully inserted {len(standard_types)} construction standard types")
    except Exception as e:
        session.rollback()
        print(f"Error inserting construction standard types: {str(e)}")
        raise e
    finally:
        session.close()

def insert_default_construction_standards(admin_user_id):
    session = get_session()
    try:
        # Check if standards already exist
        existing_standards = session.query(ConstructionStandard).count()
        if existing_standards > 0:
            print("Construction standards already exist, skipping insertion")
            return

        # Define the standards
        standards = [
            (1, "CESMM", "Civil Engineering Standard Method of Measurement", 
             "Developed by ICE (UK), used for civil engineering works like roads, bridges, and drainage. Provides rules for measuring items.",
             ["UK", "Commonwealth", "Middle East"]),
            (1, "SMM7", "Standard Method of Measurement (7th Edition)",
             "Traditional UK standard for building works. Covers work sections like concrete, masonry, finishes.",
             ["UK", "Hong Kong", "Singapore"]),
            (1, "NRM (RICS)", "New Rules of Measurement (1 & 2)",
             "Developed by RICS, replaces SMM7. NRM1 (Cost Estimation), NRM2 (Detailed BOQ).",
             ["Global (RICS-aligned projects)"]),
            (1, "POMI", "Principles of Measurement (International)",
             "Used for international projects, especially under FIDIC contracts. General rules without regional bias.",
             ["Global (FIDIC-based projects)"]),
            (1, "MMHW", "Method of Measurement for Highway Works",
             "UK standard for road and highway projects.",
             ["UK", "Middle East"]),
            (2, "IS 1200 (India)", "Indian Standard Methods of Measurement",
             "Series of codes (e.g., IS 1200-1 for Earthwork, IS 1200-12 for Plumbing).",
             ["India", "South Asia"]),
            (2, "CPWD (India)", "Central Public Works Department",
             "Used for Indian government projects. Includes labor rates and material specs.",
             ["India"]),
            (2, "ASTM E2516 (USA)", "Standard Classification for Cost Estimate Classification System",
             "Used for cost estimation in construction projects.",
             ["USA", "Canada"]),
            (2, "CSI MasterFormat (USA)", "Construction Specifications Institute Format",
             "Organizes BOQ by divisions (e.g., Concrete, Masonry). Used in USA/Canada.",
             ["USA", "Canada"]),
            (2, "DIN 276 (Germany)", "German Cost Estimation Standard",
             "Classifies costs by building elements (e.g., foundations, walls).",
             ["Germany", "EU"]),
            (2, "JIS A 0201 (Japan)", "Japanese Industrial Standard for Construction Measurement",
             "Defines measurement rules for Japanese projects.",
             ["Japan"]),
            (2, "ASMM (Australia)", "Australian Standard Method of Measurement",
             "Aligns with local construction practices.",
             ["Australia", "New Zealand"]),
            (2, "HKIS (Hong Kong)", "Hong Kong Institute of Surveyors Standard",
             "Based on SMM7 but adapted for Hong Kong.",
             ["Hong Kong"]),
            (3, "FIDIC", "International Federation of Consulting Engineers",
             "Provides contract templates with BOQ guidelines for international projects.",
             ["Global (Large Infrastructure)"]),
            (3, "ICMS (IPMS)", "International Construction Measurement Standards",
             "A global standard to unify cost classification (supported by RICS, AIQS, etc.).",
             ["Global (Cross-border projects)"]),
            (3, "OMV (South Africa)", "Standard System of Measuring Building Work",
             "Used in South African construction.",
             ["South Africa"]),
            (4, "ISO 19650", "BIM Standard for Quantity Takeoff",
             "Supports BOQ generation from BIM models.",
             ["Global (BIM Projects)"]),
            (4, "Uniclass", "UK Classification System for BIM",
             "Links BOQ items to BIM object properties.",
             ["UK", "BIM-driven projects"])
        ]

        # Insert each standard
        for type_id, code, name, description, regions in standards:
            new_standard = ConstructionStandard(
                standard_type_id=type_id,
                standard_code=code,
                name=name,
                description=description,
                regions=regions,
                units=[],  # Empty array for units as they're not specified
                status=1,
                created_by=admin_user_id,
                updated_by=admin_user_id
            )
            session.add(new_standard)

        session.commit()
        print(f"Successfully inserted {len(standards)} construction standards")
    except Exception as e:
        session.rollback()
        print(f"Error inserting construction standards: {str(e)}")
        raise e
    finally:
        session.close()

# Create default records
if __name__ == '__main__':
    admin_id = insert_default_admin_user()
    insert_default_units_and_measurements()
    insert_default_construction_standard_types(admin_id)
    insert_default_construction_standards(admin_id)

engine = create_engine('postgresql://postgres:postgres@bpms_repo:5432/bpmsdb')
with engine.connect() as connection:
    connection.execute(text('CREATE SCHEMA IF NOT EXISTS public'))
    connection.commit()
Session = sessionmaker(bind=engine)
session = Session()

def get_session():
    Base.metadata.create_all(engine)
    return Session()