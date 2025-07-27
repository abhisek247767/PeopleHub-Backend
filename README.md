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
```

---

### 3. Create a `.env` File

Create a `.env` file in the root of the backend folder and add the following:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
SESSION_SECRET=123456789
JWT_REFRESH_SECRET=123456789
JWT_SECRET=123456789
API_BASE_URL=https://projectapi.gerasim.in/api/EmployeeManagement
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> Replace `your_mongodb_connection_string`, `your_email@gmail.com`, and `your_app_password` with actual values.

---

### 4. How to Get `EMAIL_PASS`

To send emails using Gmail, you need to generate an **App Password** instead of using your normal Gmail password.

#### 📍 Step-by-Step (Gmail)

1. **Enable 2-Step Verification**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to **Security**
   - Turn on **2-Step Verification** and complete the setup

2. **Generate App Password**
   - Stay in **Security**
   - Click on **App passwords**
   - Sign in again if prompted
   - Select **Mail** under "Select app"
   - Select **Other (Custom name)** under "Select device" and type something like "PeopleHub Backend"
   - Click **Generate**
   - Copy the 16-character password shown and use it as `EMAIL_PASS` in your `.env`

> 💡 Alternatively, if email credentials are stored in the MongoDB database, you can retrieve them directly from there.

---

### 5. Start the Server

```bash
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
