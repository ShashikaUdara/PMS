from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
import os
import csv
import io
from repository import get_session, insert_project_activity, User, UserSession, Project, Team, ProjectBoq, ProjectActivity, Tag, ProjectTask
from models import (
    UserSignup, GeneralResponse, UserSignin, Token, UserResponse,
    ProjectCreate, ProjectResponse, TaskImportResponse, TaskCreate
)
from auth import get_password_hash, verify_password, get_current_user, create_user_token
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter
from sqlalchemy import or_, cast
from sqlalchemy.types import String

load_dotenv()

app = FastAPI(title="Project Management System API")
router = APIRouter(prefix="/api/v1")

# Configure CORS
origins = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8080",  # Vue frontend
    # Add your production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Redis for rate limiting
@app.on_event("startup")
async def startup():
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_url = f"redis://{redis_host}:{redis_port}"
    redis_instance = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_instance)

@router.post("/user/signup", response_model=GeneralResponse, dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def signup(user: UserSignup):
    session = get_session()
    existing_user = session.query(User).filter_by(email=user.email, status=1).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists and is active."
        )

    hashed_password = get_password_hash(user.password)
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        bio=user.bio or '',
        hashed_password=hashed_password,
        email=user.email,
        status=1,
        role=1,
        company=1
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return GeneralResponse(
        message="User signed up successfully",
        status=True,
        code=status.HTTP_201_CREATED,
        data=UserResponse.from_orm(new_user)
    )

@router.post("/user/signin", response_model=GeneralResponse, dependencies=[Depends(RateLimiter(times=5, seconds=60))])
async def signin(user: UserSignin):
    session = get_session()
    db_user = session.query(User).filter_by(email=user.email, status=1).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_user_token(db_user.id)
    
    return GeneralResponse(
        message="Signin successful",
        status=True,
        code=status.HTTP_200_OK,
        data={
            "token": token,
            "user": UserResponse.from_orm(db_user)
        }
    )

@router.post("/user/signout")
async def signout(current_user: User = Depends(get_current_user)):
    session = get_session()
    user_sessions = session.query(UserSession).filter_by(
        user_id=current_user.id,
        status=1
    ).all()
    
    for user_session in user_sessions:
        user_session.status = 0
    
    session.commit()
    return GeneralResponse(
        message="Signout successful",
        status=True,
        code=status.HTTP_200_OK,
        data=[]
    )

@router.get("/user/me", response_model=GeneralResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return GeneralResponse(
        message="User information retrieved successfully",
        status=True,
        code=status.HTTP_200_OK,
        data=UserResponse.from_orm(current_user)
    )

@router.post("/project/create", response_model=GeneralResponse, dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    session = get_session()

    # Verify that the user has access to the team
    if project.team_id:
        team = session.query(Team).filter(
            Team.id == project.team_id,
            Team.company_id == current_user.company,
            Team.status == 1
        ).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found or you don't have access to it"
            )

    # Verify BOQ exists and belongs to the company
    if project.boq_id:
        boq = session.query(ProjectBoq).filter(
            ProjectBoq.id == project.boq_id,
            ProjectBoq.company_id == current_user.company,
            ProjectBoq.status == 1
        ).first()
        if not boq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="BOQ not found or you don't have access to it"
            )

    try:
        latest_project = session.query(Project).order_by(Project.project_index.desc()).first()
        new_project_index = 1 if not latest_project else latest_project.project_index + 1

        print(f"Creating project with index: {new_project_index}, name: {project.name}")

        new_project = Project(
            project_index=new_project_index,
            name=project.name,
            description=project.description,
            status=1,
            created_by=current_user.id,
            updated_by=current_user.id
        )
        session.add(new_project)
        session.commit()
        session.refresh(new_project)

        print(f"Project created with ID: {new_project.id}")

        activity_id = insert_project_activity(new_project.id, current_user)
        print(f"Activity created with ID: {activity_id}")
        
        return GeneralResponse(
            message="Project created successfully",
            status=True,
            code=status.HTTP_201_CREATED,
            data=ProjectResponse.from_orm(new_project)
        )
    except IntegrityError as e:
        session.rollback()
        print(f"IntegrityError while creating project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating project. Please check if all referenced entities exist."
        )
    except Exception as e:
        session.rollback()
        print(f"Unexpected error while creating project: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the project: {str(e)}"
        )

@router.get("/projects/list", response_model=GeneralResponse)
async def get_project_list(
    userId: int, 
    page: int = 1, 
    limit: int = 10,
    sortField: str = "created_at",
    sortDirection: str = "desc",
    search: str = None,
    project_status: int = None,
    current_user: User = Depends(get_current_user)
):
    session = get_session()

    # Security check: Users can only view their own projects unless they are admins
    if userId != current_user.id and current_user.role != 1:  # Assuming role 1 is admin
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own projects"
        )

    # Verify if the user exists
    user = session.query(User).filter(User.id == userId, User.status == 1).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    try:
        # Build base query
        base_query = session.query(Project).filter(
            Project.created_by == userId
        )

        # Apply status filter if provided
        if project_status is not None:
            base_query = base_query.filter(Project.status == project_status)

        # Apply search filter if search parameter is provided
        if search and search.strip():
            search_term = f"%{search.strip()}%"
            base_query = base_query.filter(
                or_(
                    Project.name.ilike(search_term),
                    Project.description.ilike(search_term),
                    cast(Project.project_index, String).ilike(search_term)  # Search in project_index
                )
            )

        # Get total count of projects after applying search and status filters
        total_projects = base_query.count()

        # Calculate offset
        offset = (page - 1) * limit

        # Get the sort column
        if hasattr(Project, sortField):
            sort_column = getattr(Project, sortField)
            if sortDirection.lower() == "desc":
                sort_column = sort_column.desc()
            else:
                sort_column = sort_column.asc()
            base_query = base_query.order_by(sort_column)
        else:
            # Fallback to default sorting if invalid field
            base_query = base_query.order_by(Project.created_at.desc())

        # Get paginated and sorted projects
        projects = base_query.offset(offset).limit(limit).all()
        
        # Transform projects to response model
        project_list = [ProjectResponse.from_orm(project) for project in projects]

        # Calculate total pages
        total_pages = (total_projects + limit - 1) // limit

        return GeneralResponse(
            message="Project list retrieved successfully",
            status=True,
            code=status.HTTP_200_OK,
            data={
                "projects": project_list,
                "pagination": {
                    "current_page": page,
                    "total_pages": total_pages,
                    "total_items": total_projects,
                    "items_per_page": limit
                }
            }
        )
    except Exception as e:
        print(f"Error fetching projects: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching projects"
        )
    finally:
        session.close()

@router.get("/project/detail", response_model=GeneralResponse)
async def get_project_detail(
    projectId: int,
    current_user: User = Depends(get_current_user)
):
    session = get_session()
    
    # Get project with user permission check
    project = session.query(Project).filter(
        Project.id == projectId,
        Project.created_by == current_user.id  # Only allow access to projects created by the user
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission to access it"
        )
    
    try:
        return GeneralResponse(
            message="Project detail retrieved successfully",
            status=True,
            code=status.HTTP_200_OK,
            data=ProjectResponse.from_orm(project)
        )
    except Exception as e:
        print(f"Error fetching project details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching project details"
        )
    finally:
        session.close()

@router.post("/project/{projectId}/update", response_model=GeneralResponse)
async def update_project(
    projectId: int,
    project: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    session = get_session()
    
    try:
        # Get existing project with permission check
        existing_project = session.query(Project).filter(
            Project.id == projectId,
            Project.updated_by == current_user.id
        ).first()
        
        if not existing_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or you don't have permission to update it"
            )

        # Verify team access if team_id is provided and not -1
        if project.team_id and project.team_id != -1:
            team = session.query(Team).filter(
                Team.id == project.team_id,
                Team.company_id == current_user.company,
                Team.status == 1
            ).first()
            if not team:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Team not found or you don't have access to it"
                )

        # Verify BOQ access if boq_id is provided and not -1
        if project.boq_id and project.boq_id != -1:
            boq = session.query(ProjectBoq).filter(
                ProjectBoq.id == project.boq_id,
                ProjectBoq.company_id == current_user.company,
                ProjectBoq.status == 1
            ).first()
            if not boq:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="BOQ not found or you don't have access to it"
                )

        # Handle tags
        tag_ids = []
        if project.tags:
            for tag_value in project.tags:
                # Get the next available tag_index
                max_index = session.query(Tag.tag_index).order_by(Tag.tag_index.desc()).first()
                next_index = 1 if max_index is None else max_index[0] + 1
                
                # Create new tag
                new_tag = Tag(
                    tag_index=next_index,
                    tag_type=1,  # You might want to make this configurable
                    tag_value=tag_value,
                    name=tag_value,
                    description=f"Tag for project {projectId}",
                    status=1,
                    created_by=current_user.id,
                    updated_by=current_user.id
                )
                session.add(new_tag)
                session.flush()  # This will assign an ID to the new tag
                tag_ids.append(new_tag.id)

        # Update project fields
        existing_project.name = project.name
        existing_project.description = project.description
        existing_project.status = project.status
        
        # Only update team_id if it's provided and not -1
        if project.team_id is not None and project.team_id != -1:
            existing_project.team_id = project.team_id
            
        # Only update boq_id if it's provided and not -1
        if project.boq_id is not None and project.boq_id != -1:
            existing_project.boq_id = project.boq_id
            
        existing_project.tag_id = tag_ids[0] if tag_ids else None  # Set the first tag as primary tag
        existing_project.updated_by = current_user.id
        existing_project.updated_at = datetime.now(timezone.utc)

        session.commit()
        session.refresh(existing_project)

        return GeneralResponse(
            message="Project updated successfully",
            status=True,
            code=status.HTTP_200_OK,
            data=ProjectResponse.from_orm(existing_project)
        )

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print(f"Error updating project: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the project"
        )
    finally:
        session.close()

@router.post("/project/{project_id}/tasks/import", response_model=GeneralResponse)
async def import_project_tasks(
    project_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    session = get_session()
    
    # Verify project exists and user has access
    project = session.query(Project).filter(
        Project.id == project_id,
        Project.status == 1
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have access to it"
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )
    
    try:
        # Read the CSV file
        contents = await file.read()
        csv_file = io.StringIO(contents.decode('utf-8'))
        csv_reader = csv.DictReader(csv_file)
        
        import_stats = {
            'total_rows': 0,
            'imported_rows': 0,
            'failed_rows': 0,
            'errors': []
        }
        
        # Get the latest task index for this project
        latest_task = session.query(ProjectTask).filter(
            ProjectTask.project_id == project_id
        ).order_by(ProjectTask.task_index.desc()).first()
        
        next_task_index = 1 if not latest_task else latest_task.task_index + 1
        
        for row in csv_reader:
            import_stats['total_rows'] += 1
            try:
                # Convert string values to appropriate types
                priority = int(row.get('priority', 1))
                task_status = int(row.get('status', 1))
                estimated_hours = int(row.get('estimated_hours')) if row.get('estimated_hours') else None
                actual_hours = int(row.get('actual_hours')) if row.get('actual_hours') else None
                
                # Parse dates if provided
                start_date = datetime.fromisoformat(row['start_date']) if row.get('start_date') else None
                due_date = datetime.fromisoformat(row['due_date']) if row.get('due_date') else None
                completed_date = datetime.fromisoformat(row['completed_date']) if row.get('completed_date') else None
                
                # Create new task
                new_task = ProjectTask(
                    task_index=next_task_index,
                    project_id=project_id,
                    title=row['task_name'],
                    description=row.get('description'),
                    priority=priority,
                    status=task_status,
                    assigned_to=int(row['assigned_to']) if row.get('assigned_to') else None,
                    estimated_hours=estimated_hours,
                    actual_hours=actual_hours,
                    start_date=start_date,
                    due_date=due_date,
                    completed_date=completed_date,
                    parent_task_id=int(row['parent_task_id']) if row.get('parent_task_id') else None,
                    tags=row.get('tags', '').split(',') if row.get('tags') else None,
                    created_by=current_user.id,
                    updated_by=current_user.id
                )
                
                session.add(new_task)
                next_task_index += 1
                import_stats['imported_rows'] += 1
                
            except Exception as e:
                import_stats['failed_rows'] += 1
                import_stats['errors'].append(f"Error in row {import_stats['total_rows']}: {str(e)}")
                continue
        
        session.commit()

        print("reached here")
        
        return GeneralResponse(
            message="Tasks imported successfully",
            status=True,
            code=status.HTTP_201_CREATED,
            data=TaskImportResponse(
                total_rows=import_stats['total_rows'],
                imported_rows=import_stats['imported_rows'],
                failed_rows=import_stats['failed_rows'],
                errors=import_stats['errors']
            )
        )
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing tasks: {str(e)}"
        )
    finally:
        await file.close()

@router.get("/project/{project_id}/tasks/get", response_model=GeneralResponse)
async def get_project_tasks(
    project_id: int,
    page: int = 1,
    limit: int = 10,
    sortField: str = "created_at",
    sortDirection: str = "desc",
    search: str = None,
    current_user: User = Depends(get_current_user)
):
    session = get_session()
    
    try:
        # Verify project exists and user has access
        project = session.query(Project).filter(
            Project.id == project_id,
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        # Check if user has access to the project
        # Allow access if user is admin (role=1) or if they created the project
        if current_user.role != 1 and project.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this project's tasks"
            )

        # Build base query
        base_query = session.query(ProjectTask).filter(
            ProjectTask.project_id == project_id
        )

        # Apply search filter if search parameter is provided
        if search and search.strip():
            search_term = f"%{search.strip()}%"
            base_query = base_query.filter(
                or_(
                    ProjectTask.title.ilike(search_term),
                    ProjectTask.description.ilike(search_term),
                    cast(ProjectTask.task_index, String).ilike(search_term)  # Search in task_index
                )
            )

        # Get total count of tasks after applying search
        total_tasks = base_query.count()

        # Calculate offset for pagination
        offset = (page - 1) * limit

        # Apply sorting
        if hasattr(ProjectTask, sortField):
            sort_column = getattr(ProjectTask, sortField)
            if sortDirection.lower() == "desc":
                sort_column = sort_column.desc()
            else:
                sort_column = sort_column.asc()
            base_query = base_query.order_by(sort_column)
        else:
            # Fallback to default sorting
            base_query = base_query.order_by(ProjectTask.created_at.desc())

        # Get paginated tasks
        tasks = base_query.offset(offset).limit(limit).all()

        # Transform tasks to dict for response
        task_list = []
        for task in tasks:
            task_dict = {
                "id": task.id,
                "task_index": task.task_index,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "assigned_to": task.assigned_to,
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "start_date": task.start_date,
                "due_date": task.due_date,
                "completed_date": task.completed_date,
                "parent_task_id": task.parent_task_id,
                "tags": task.tags,
                "created_at": task.created_at,
                "created_by": task.created_by,
                "updated_at": task.updated_at,
                "updated_by": task.updated_by
            }
            task_list.append(task_dict)

        # Calculate total pages
        total_pages = (total_tasks + limit - 1) // limit

        return GeneralResponse(
            message="Project tasks retrieved successfully",
            status=True,
            code=status.HTTP_200_OK,
            data={
                "tasks": task_list,
                "pagination": {
                    "current_page": page,
                    "total_pages": total_pages,
                    "total_items": total_tasks,
                    "items_per_page": limit
                }
            }
        )

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print(f"Error fetching project tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching project tasks: {str(e)}"
        )
    finally:
        session.close()

@router.post("/project/{project_id}/task/create", response_model=GeneralResponse)
async def create_project_task(
    project_id: int,
    task: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    session = get_session()
    
    try:
        # Verify project exists and user has access
        project = session.query(Project).filter(
            Project.id == project_id
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        # Check if user has access to the project
        if current_user.role != 1 and project.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to create tasks in this project"
            )

        # Get the latest task index for this project
        latest_task = session.query(ProjectTask).filter(
            ProjectTask.project_id == project_id
        ).order_by(ProjectTask.task_index.desc()).first()
        
        next_task_index = 1 if not latest_task else latest_task.task_index + 1

        # Validate parent task if provided
        if task.parent_task_id:
            parent_task = session.query(ProjectTask).filter(
                ProjectTask.id == task.parent_task_id,
                ProjectTask.project_id == project_id
            ).first()
            if not parent_task:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent task not found in this project"
                )

        # Create new task
        new_task = ProjectTask(
            task_index=next_task_index,
            project_id=project_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            status=task.status,
            assigned_to=task.assigned_to,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            start_date=task.start_date,
            due_date=task.end_date,  # Map end_date from request to due_date in DB
            parent_task_id=task.parent_task_id,
            tags=task.tags,
            created_by=current_user.id,
            updated_by=current_user.id
        )
        
        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        # Transform task to dict for response
        task_dict = {
            "id": new_task.id,
            "task_index": new_task.task_index,
            "title": new_task.title,
            "description": new_task.description,
            "priority": new_task.priority,
            "status": new_task.status,
            "assigned_to": new_task.assigned_to,
            "estimated_hours": new_task.estimated_hours,
            "actual_hours": new_task.actual_hours,
            "start_date": new_task.start_date,
            "due_date": new_task.due_date,
            "completed_date": new_task.completed_date,
            "parent_task_id": new_task.parent_task_id,
            "tags": new_task.tags,
            "created_at": new_task.created_at,
            "created_by": new_task.created_by,
            "updated_at": new_task.updated_at,
            "updated_by": new_task.updated_by
        }
        
        return GeneralResponse(
            message="Task created successfully",
            status=True,
            code=status.HTTP_201_CREATED,
            data=task_dict
        )
        
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        session.rollback()
        print(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the task: {str(e)}"
        )
    finally:
        session.close()

app.include_router(router)