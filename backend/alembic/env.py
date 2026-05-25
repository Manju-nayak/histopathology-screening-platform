import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# 1. Append the parent backend directory to the system path
# This allows Alembic to import the 'app' module correctly during migrations
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.db.base import Base  # Aggregated base mapping all models for autogenerate

# Alembic configuration object
config = context.config

# Setup standard logging config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 2. Inject DATABASE_URL dynamically from Pydantic Settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# 3. Associate declarative metadata for migration tracking
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode. E.g. generating SQL dump scripts."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode. E.g. applying changes directly to DB."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
