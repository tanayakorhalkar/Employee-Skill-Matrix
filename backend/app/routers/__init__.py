from app.routers.auth import router as auth_router
from app.routers.employees import router as employees_router
from app.routers.skills import router as skills_router
from app.routers.employee_skills import router as employee_skills_router

__all__ = ["auth_router", "employees_router", "skills_router", "employee_skills_router"]
