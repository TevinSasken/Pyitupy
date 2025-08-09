# db.py
import psycopg2
import os

# If needed, change these to your actual credentials
DB_NAME = "pyitupy"
DB_USER = "postgres"
DB_PASSWORD = "Barrister@2022"  # Empty since you said no password
DB_HOST = "localhost"
DB_PORT = "5432"

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB", "pyitupy"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "Barrister@2022"),  # change to your real password
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432")
    )
