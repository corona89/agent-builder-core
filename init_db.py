import bcrypt
import sqlite3
import os

db_path = 'agent-builder/backend/agent_builder.db'
email = "corona89@nate.com"
password = "New1234!"

# Hash the password
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Connect to DB and insert
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create tables manually if needed, but main.py should do it.
# However, create_user.py runs before uvicorn might have initialized the DB if it was deleted.
# Let's just let main.py initialize it first.
conn.close()
