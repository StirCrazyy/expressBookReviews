const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Extract token from Bearer header
        const token = authHeader.split(' ')[1];
        
        // Verify the token
        const decoded = jwt.verify(token, "fingerprint_customer");
        
        // Add user info to request object
        req.user = decoded;
        
        // Continue to next middleware
        next();
    } catch (error) {
        return res.status(403).json({ 
            message: "Invalid or expired token",
            error: error.message 
        });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
