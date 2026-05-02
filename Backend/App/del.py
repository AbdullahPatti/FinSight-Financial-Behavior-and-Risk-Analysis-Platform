import sqlite3

conn = sqlite3.connect("finsight.db")
cursor = conn.cursor()

cursor.execute("""
    ALTER TABLE quarterly_summary
    ADD COLUMN user_id INTEGER
""")

conn.commit()
conn.close()

print("Column 'user_id' added successfully.")