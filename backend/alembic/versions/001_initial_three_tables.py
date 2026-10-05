"""001_initial_three_tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-10-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Employee Table
    op.create_table(
        'Employee',
        sa.Column('emp_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('fName', sa.String(length=100), nullable=False),
        sa.Column('lName', sa.String(length=100), nullable=False),
        sa.Column('Login_userid', sa.String(length=100), nullable=False),
        sa.Column('Login_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_on', sa.DateTime(), nullable=False),
        sa.Column('updated_on', sa.DateTime(), nullable=False),
        sa.Column('last_logged_in', sa.DateTime(), nullable=True),
        sa.Column('roles', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('emp_id')
    )
    op.create_index(op.f('ix_Employee_emp_id'), 'Employee', ['emp_id'], unique=False)
    op.create_index(op.f('ix_Employee_Login_userid'), 'Employee', ['Login_userid'], unique=True)

    # 2. Skills Table
    op.create_table(
        'Skills',
        sa.Column('skill_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('skill_type', sa.String(length=100), nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('skillname', sa.String(length=150), nullable=False),
        sa.Column('skill_description', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('skill_id')
    )
    op.create_index(op.f('ix_Skills_skill_id'), 'Skills', ['skill_id'], unique=False)

    # 3. Employee_skills Table
    op.create_table(
        'Employee_skills',
        sa.Column('unique_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('emp_id', sa.Integer(), nullable=False),
        sa.Column('self_rating', sa.SmallInteger(), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('add_update_timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['emp_id'], ['Employee.emp_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['Skills.skill_id'], ondelete='CASCADE'),
        sa.CheckConstraint('self_rating >= 1 AND self_rating <= 5', name='check_self_rating_range'),
        sa.PrimaryKeyConstraint('unique_id')
    )
    op.create_index(op.f('ix_Employee_skills_unique_id'), 'Employee_skills', ['unique_id'], unique=False)

def downgrade() -> None:
    op.drop_table('Employee_skills')
    op.drop_table('Skills')
    op.drop_table('Employee')
