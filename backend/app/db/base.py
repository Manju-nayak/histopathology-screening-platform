# Import all models so that Alembic has database schema metadata
# This allows 'autogenerate' to detect changes in models and create correct migrations
from app.db.session import Base  # noqa
from app.models.user import User  # noqa
from app.models.patient import Patient  # noqa
from app.models.scan import Scan  # noqa
from app.models.report import Report  # noqa
