"""Add employee profile picture storage.

Revision ID: 004_employee_profile_picture
Revises: 003_skill_descriptions_text
"""
from alembic import op
import sqlalchemy as sa

revision = "004_employee_profile_picture"
down_revision = "003_skill_descriptions_text"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("Employee", sa.Column("profile_picture", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("Employee", "profile_picture")
