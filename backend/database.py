import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root@7024",
        database="student_community"
    )
    return connection
