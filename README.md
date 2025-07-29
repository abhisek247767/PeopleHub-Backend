# 1. Clone the backend repo
- git clone https://github.com/abhisek247767/PeopleHub-Backend.git
- cd PeopleHub-Backend

# 2. Install backend dependencies
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

congratulations you have set up the backend repo, now go to frontend repo https://github.com/abhisek247767/PeopleHub-Frontend
## Please follow me and star the repo for my motivation :)
