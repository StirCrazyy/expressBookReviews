const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return username && typeof username === 'string' && username.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.find(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // Validate username format
        if (!isValid(username)) {
            return res.status(400).json({
                message: "Invalid username format"
            });
        }

        // Authenticate user
        if (!authenticatedUser(username, password)) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: username },
            "fingerprint_customer",
            { expiresIn: "1h" }
        );

        // Set session
        req.session.authorization = {
            accessToken: token
        }

        return res.status(200).json({
            message: "Login successful",
            token: token
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error during login",
            error: error.message
        });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
        const isbn = req.params.isbn;
        const review = req.query.review;
        const username = req.user.username;  // Get username from JWT payload

        // Validate inputs
        if (!isbn || !review) {
            return res.status(400).json({
                message: "ISBN and review are required"
            });
        }

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Book not found with ISBN: " + isbn
            });
        }

        // Add or modify review
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/modified successfully",
            isbn: isbn,
            username: username,
            review: review
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error adding review",
            error: error.message
        });
    }
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    try {
        const isbn = req.params.isbn;
        const username = req.user.username;  // Get username from JWT payload

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Book not found with ISBN: " + isbn
            });
        }

        // Check if user has reviewed this book
        if (!books[isbn].reviews[username]) {
            return res.status(404).json({
                message: "No review found for this book by user: " + username
            });
        }

        // Delete the review
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            isbn: isbn,
            username: username
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting review",
            error: error.message
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
