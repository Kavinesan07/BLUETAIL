"""add is_deleted column

Revision ID: b24aaaeaa990
Revises:
Create Date: 2026-10-28 11:42:23.663503
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b24aaaeaa990'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'products',
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('0')
        )
    )


def downgrade() -> None:
    op.drop_column('products', 'is_deleted')

