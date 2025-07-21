require("dotenv").config();
const express = require("express");
const app = express()
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URI

//app.use(express.static('./dist/employee'));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST',
  credentials: true,
}));

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


// app.get('/', (req, res) => {
//     res.send('running');
// });


mongoose.connect(DB)
        .then(() => {
            console.log("Connected to MongoDB");
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            })
        }).catch((err) =>{
            console.log(`Failed to connect to MongoDB: ${err}`);
        })


app.use(authRoutes, userRoutes);
