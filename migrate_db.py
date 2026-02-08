import sqlite3

db_path = 'agent-builder/backend/agent_builder.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add agent_type column to apps table
    cursor.execute("ALTER TABLE apps ADD COLUMN agent_type TEXT DEFAULT 'general'")
    print("Column agent_type added to apps table.")
except sqlite3.OperationalError:
    print("Column agent_type already exists or table doesn't exist.")

conn.commit()
conn.close()
