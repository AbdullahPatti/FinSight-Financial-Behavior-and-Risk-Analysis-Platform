import sqlite3

conn = sqlite3.connect("finsight.db")
cursor = conn.cursor()

# Delete from transactions table
cursor.execute("DELETE FROM transactions WHERE user_id = 2")
transactions_deleted = cursor.rowcount

# Delete from quarterly_summary table
cursor.execute("DELETE FROM quarterly_summary WHERE user_id = 2")
summary_deleted = cursor.rowcount

conn.commit()
conn.close()

print(f"{transactions_deleted} rows deleted from transactions.")
print(f"{summary_deleted} rows deleted from quarterly_summary.")