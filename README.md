# PeopleHub Backend

This is the backend server for the **PeopleHub** application – an Employee Management System. It is built with **Node.js**, **Express**, and **MongoDB** and handles authentication, session management, email notifications, and integration with an external API.

---

## 🚀 Features

- Employee CRUD operations
- Authentication using JWT tokens and session-based auth
- Secure email notifications using Gmail SMTP
- Modular project structure with MVC pattern
- RESTful API integration with third-party services
- Environment-based configuration

---

## 📦 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-yellow?style=for-the-badge&logo=gmail&logoColor=white)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=envato&logoColor=white)

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/abhisek247767/PeopleHub-Backend.git
cd PeopleHub-Backend
```

---

### 2. Install Dependencies

```bash
npm install

# 3. Create a .env file in the root of backend folder and add:
- MONGO_URI=your_mongodb_connection_string
- PORT=3000
- SESSION_SECRET=123456789
- JWT_REFRESH_SECRET=123456789
- JWT_SECRET=123456789
- API_BASE_URL=https://projectapi.gerasim.in/api/EmployeeManagement
- EMAIL_USER=your-email
- EMAIL_PASS=bcis nnby plef uofc
- FRONTEND_BASE_URL=http://localhost:4200

# 4. Get the Email_User and Email_pass
To get the EMAIL_PASS for Gmail, you need to create an App Password (not your regular Gmail password). Here's how:
For Gmail (Most Common):
Step 1: Enable 2-Factor Authentication

Go to Google Account Settings
Click on Security in the left sidebar
Under "Signing in to Google", enable 2-Step Verification if not already enabled
Follow the setup process (you'll need your phone)

Step 2: Generate App Password

Still in Security settings
Under "Signing in to Google", click App passwords
You might need to sign in again
Select Mail from the "Select app" dropdown
Select Other (Custom name) from "Select device" dropdown
Enter a name like "Node.js App" or "My Website"
Click Generate
Google will show you a 16-character password like: abcd efgh ijkl mnop

Or you could just enter the verification code from the mongodb database

# 5. Start the backend server
npm start
```

The server will run at:  
👉 `http://localhost:3000`

---

## 🌐 API Base URL

The backend interacts with this external API:

```
https://projectapi.gerasim.in/api/EmployeeManagement
```

---

## 📁 Project Structure

```bash
PeopleHub-Backend/
│
├── src/                  # Source code 
├── .dockerignore         # Files to ignore in Docker builds
├── .gitignore            # Files to ignore in Git
├── dockerfile            # Docker build instructions
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Dependency lock file
└── README.md             # Project documentation
```

---

## 📲 Frontend Setup

Once the backend is up and running, head over to the **Frontend Repo** and follow the setup instructions:

🔗 [PeopleHub-Frontend Repository](https://github.com/abhisek247767/PeopleHub-Frontend)

---

## ❤️ Support the Developer

If you like this project:

⭐ **Star this repository**  
👤 **Follow [@abhisek247767](https://github.com/abhisek247767)** for more cool projects

> Your support helps keep the motivation alive!

---

## 📧 Contact

For issues or questions, feel free to open an issue or reach out via GitHub.

---
