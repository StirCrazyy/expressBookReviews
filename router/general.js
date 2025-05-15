const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        // Check if username is already taken
        if (users.find(user => user.username === username)) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        // Add new user to users array
        users.push({ username, password });

        return res.status(201).json({
            message: "User registered successfully",
            username: username
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  try {
        // Return all books with proper formatting (indentation of 4 spaces)
        return res.status(200).json({
            message: "Books retrieved successfully",
            books: JSON.parse(JSON.stringify(books, null, 4))
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  try {
        const isbn = req.params.isbn;

        // Check if book exists with the given ISBN
        if (books[isbn]) {
            return res.status(200).json({
                message: "Book found successfully",
                book: books[isbn]
            });
        } else {
            return res.status(404).json({
                message: "Book not found with ISBN: " + isbn
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving book",
            error: error.message
        });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  try {
        const requestedAuthor = req.params.author.toLowerCase();
        const booksByAuthor = {};

        // Get all ISBN keys and filter books by author
        Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === requestedAuthor) {
                booksByAuthor[isbn] = books[isbn];
            }
        });

        // Check if any books were found
        if (Object.keys(booksByAuthor).length > 0) {
            return res.status(200).json({
                message: "Books found successfully",
                books: booksByAuthor
            });
        } else {
            return res.status(404).json({
                message: "No books found for author: " + req.params.author
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  try {
        const requestedTitle = req.params.title.toLowerCase();
        const booksByTitle = {};

        // Get all ISBN keys and filter books by title
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase().includes(requestedTitle)) {
                booksByTitle[isbn] = books[isbn];
            }
        });

        // Check if any books were found
        if (Object.keys(booksByTitle).length > 0) {
            return res.status(200).json({
                message: "Books found successfully",
                books: booksByTitle
            });
        } else {
            return res.status(404).json({
                message: "No books found with title containing: " + req.params.title
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  try {
        const isbn = req.params.isbn;

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Book not found with ISBN: " + isbn
            });
        }

        // Get reviews for the book
        const reviews = books[isbn].reviews;

        // Check if book has any reviews
        if (Object.keys(reviews).length > 0) {
            return res.status(200).json({
                message: "Reviews retrieved successfully",
                isbn: isbn,
                reviews: reviews
            });
        } else {
            return res.status(404).json({
                message: "No reviews found for book with ISBN: " + isbn
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving reviews",
            error: error.message
        });
    }
});

// Get the book list available in the shop (using async/await)
public_users.get('/async', async (req, res) => {
    try {
        // Create a promise to get all books
        const getAllBooks = () => {
            return new Promise((resolve, reject) => {
                try {
                    const formattedBooks = JSON.parse(JSON.stringify(books, null, 4));
                    resolve(formattedBooks);
                } catch (error) {
                    reject(error);
                }
            });
        };

        // Wait for the promise to resolve
        const booksList = await getAllBooks();

        return res.status(200).json({
            message: "Books retrieved successfully",
            books: booksList
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});

// Alternative Promise-based implementation using .then()
public_users.get('/promise', (req, res) => {
    // Create a promise to get all books
    const getAllBooks = new Promise((resolve, reject) => {
        try {
            const formattedBooks = JSON.parse(JSON.stringify(books, null, 4));
            resolve(formattedBooks);
        } catch (error) {
            reject(error);
        }
    });

    // Handle the promise
    getAllBooks
        .then(booksList => {
            return res.status(200).json({
                message: "Books retrieved successfully",
                books: booksList
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: "Error retrieving books",
                error: error.message
            });
        });
});

// Get book by ISBN using async/await
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Create a promise to get book by ISBN
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                try {
                    if (books[isbn]) {
                        resolve(books[isbn]);
                    } else {
                        reject(new Error(`Book not found with ISBN: ${isbn}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        };

        // Wait for the promise to resolve
        const book = await getBookByISBN(isbn);

        return res.status(200).json({
            message: "Book found successfully",
            book: book
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
});

// Get book by ISBN using Promise.then()
public_users.get('/promise/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    // Create a promise to get book by ISBN
    const getBookByISBN = new Promise((resolve, reject) => {
        try {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error(`Book not found with ISBN: ${isbn}`));
            }
        } catch (error) {
            reject(error);
        }
    });

    // Handle the promise
    getBookByISBN
        .then(book => {
            return res.status(200).json({
                message: "Book found successfully",
                book: book
            });
        })
        .catch(error => {
            return res.status(404).json({
                message: error.message
            });
        });
});

module.exports.general = public_users;
