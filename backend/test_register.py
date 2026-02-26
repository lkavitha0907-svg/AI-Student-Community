import requests

url = "http://127.0.0.1:5000/register"

data = {
    "name": "Kavi",
    "email": "kavi@example.com",
    "password": "123456",
    "role": "student"
}

response = requests.post(url, json=data)
print(response.json())
