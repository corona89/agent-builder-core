import bcrypt
import sqlite3

db_path = 'agent-builder/backend/agent_builder.db'
email = "corona89@nate.com"
password = "New1234!"

hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("INSERT INTO users (email, hashed_password, is_active) VALUES (?, ?, ?)", (email, hashed, 1))
conn.commit()
conn.close()
print("User created.")
