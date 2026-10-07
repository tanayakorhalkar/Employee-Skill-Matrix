"""Allow half-star rating precision.

Revision ID: 002_decimal_ratings
Revises: 001_initial
"""
from alembic import op
import sqlalchemy as sa

revision = "002_decimal_ratings"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("check_self_rating_range", "Employee_skills", type_="check")
    op.alter_column(
        "Employee_skills",
        "self_rating",
        existing_type=sa.SmallInteger(),
        type_=sa.Numeric(2, 1),
        existing_nullable=False,
    )
    op.create_check_constraint(
        "check_self_rating_range",
        "Employee_skills",
        "self_rating >= 0.5 AND self_rating <= 5",
    )


def downgrade() -> None:
    op.drop_constraint("check_self_rating_range", "Employee_skills", type_="check")
    op.alter_column(
        "Employee_skills",
        "self_rating",
        existing_type=sa.Numeric(2, 1),
        type_=sa.SmallInteger(),
        existing_nullable=False,
    )
    op.create_check_constraint(
        "check_self_rating_range",
        "Employee_skills",
        "self_rating >= 1 AND self_rating <= 5",
    )
