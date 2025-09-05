require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require("express-session");
const MongoStore = require("connect-mongo");


const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employee");
const projectRoutes = require("./routes/project");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URI

//app.use(express.static('./dist/employee'));
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:4200';

// Middleware

// Change the Middleware order as per Express require for correct implementation

app.use(cors({
  origin: FRONTEND_BASE_URL,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  // Explicitely Allow Authorization header on CORS
  allowedHeaders : ['Content-Type', 'Authorization'],
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(cookieParser());


// Session middleware with MongoDB Session Store Configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET, 
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: DB,
        collectionName: 'sessions',
        ttl: 3600, 
      }),
      cookie: {
        httpOnly: true,
        secure: true, 
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60, 
      },
    })
)

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running', 
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/auth/*',
            users: '/users/*',
            employees: '/employees/*',
            projects: '/projects/*'
        }
    });
});

// app.get('/', (req, res) => {
//     res.send('running');
// });

// app.use(authRoutes, userRoutes, employeeRoutes, projectRoutes, dashboardRoutes);

// Register seperate routes as only first one and '/' is consider while using above line of code 
app.use(authRoutes)
app.use(userRoutes)
app.use(employeeRoutes)
app.use(projectRoutes)
app.use(dashboardRoutes)


mongoose.connect(DB)
        .then(() => {
            console.log("Connected to MongoDB");
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            })
        }).catch((err) =>{
            console.log(`Failed to connect to MongoDB: ${err}`);
        });




