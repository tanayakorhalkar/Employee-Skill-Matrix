"""Store skill descriptions as text.

Revision ID: 003_skill_descriptions_text
Revises: 002_decimal_ratings
"""
from alembic import op
import sqlalchemy as sa

revision = "003_skill_descriptions_text"
down_revision = "002_decimal_ratings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "Skills",
        "skill_description",
        existing_type=sa.DateTime(),
        type_=sa.Text(),
        existing_nullable=False,
        server_default="",
        postgresql_using="skill_description::text",
    )


def downgrade() -> None:
    op.alter_column(
        "Skills",
        "skill_description",
        existing_type=sa.Text(),
        type_=sa.DateTime(),
        existing_nullable=False,
        existing_server_default="",
        server_default=sa.text("CURRENT_TIMESTAMP"),
        postgresql_using="skill_description::timestamp",
    )
