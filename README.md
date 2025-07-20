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
# 4. Start the backend server
npm start
