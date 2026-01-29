const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

// Middleware for handling not found errors
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// snippet routes import
const snippetRoutes = require("./routes/snippet.routes");

// Port to run the server on
const port = process.env.PORT || 3000;

// Create the Express app
const app = express();

// Enable CORS for all routes
// The credentials option is set to true, indicating that the server can include credentials(eg: cookies, HTTP authentication) in cross-origin requests.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Allow incoming requests to have a JSON body
app.use(express.json());

// Allow incoming requests to have a URL encoded body
app.use(express.urlencoded({ extended: true }));

// Allow incoming requests to have a cookie
app.use(cookieParser());

// Connection to Database
const connectDB = require("./config/db");
connectDB();


// Routes for the authentication
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

// Routes for user
const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

// Routes for snippet
app.use("/snippets", snippetRoutes);

// Root route handler
app.get("/", (req, res) => res.send(`Server running on port ${port}`));

// Middleware for handling errors
app.use(notFound);
app.use(errorHandler);

// Listen for incoming requests
app.listen(port, () => console.log(`Listening on port ${port}`));
