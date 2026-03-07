import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root@7024",
        database="student_community"
    )
    return connection
# ---------- QUERY HELPER (Senior Style) ----------
def execute_query(query, params=None, fetchone=False, commit=False):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(query, params or ())

    result = None

    if commit:
        conn.commit()

    if fetchone:
        result = cursor.fetchone()
    else:
        result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result