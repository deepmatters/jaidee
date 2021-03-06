"""Create User table

Revision ID: 8f2d7d61c981
Revises: 
Create Date: 2021-10-03 08:13:05.209276

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f2d7d61c981'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('email', sa.String(length=100), nullable=True),
    sa.Column('password_hash', sa.String(length=200), nullable=True),
    sa.Column('role', sa.String(length=20), nullable=True),
    sa.Column('create_dt', sa.DateTime(), nullable=True),
    sa.Column('lastlogin_dt', sa.DateTime(), nullable=True),
    sa.Column('password_reset_id', sa.String(length=12), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user')
    # ### end Alembic commands ###
