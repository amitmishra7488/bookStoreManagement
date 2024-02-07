const AuthorRevenueModel = require("../models/authorRevenueModel");
const BookModel = require("../models/book.models");
const calculateTotalMonthlyAndYearlyRevenue = require("../utils/monthlyAndYearlyRevenue");
const { bookLaunchNotification } = require("../utils/notifyAllUser");

const launchBook = async (req, res) => {
  try {
    const { title, description, price, additionalAuthors } = req.body;
    const firstAuthor = req.userId; // Extract first author ID from req.userId

    // Combine the first author ID with additional author IDs
    let authors = [firstAuthor];
    if (additionalAuthors) {
      authors = [firstAuthor, ...additionalAuthors];
    }
    // Create a new book document
    const newBook = new BookModel({
      authors,
      title,
      description,
      price,
    });

    // Save the new book to the database
    await newBook.save();

    for (const authorId of authors) {
      // Check if the author already has a revenue model
      let revenueModel = await AuthorRevenueModel.findOne({ author: authorId });

      if (!revenueModel) {
        // Create a new revenue model with default values
        revenueModel = new AuthorRevenueModel({ author: authorId });
      }
      // Save or update the revenue model
      await revenueModel.save();
    }
    const bookData = {
      title: title,
      description: description,
      price: price,
    }

    await bookLaunchNotification(bookData)
    res.status(201).json({ message: "Book added successfully", book: newBook});

    
  } catch (error) {
    console.error("Error adding book:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getBookForAuthor = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({ message: "Not found" });
    }
    const booksData = await BookModel.find({ authors: userId });

    // Calculate revenue for each book and sum up total revenue
    let totalRevenue = 0;
    for (const book of booksData) {
      const revenue = book.sellCount * book.price;
      totalRevenue += revenue;
      book.revenue = revenue; // Add revenue to book object
    }

    res.status(200).json({ bookdata: booksData, totalRevenue });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

const getAuthorRevenue = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get author's total revenue
    let authorRevenue = await AuthorRevenueModel.findOne({ author: userId });
    let totalRevenue = authorRevenue.totalRevenue;
    if (!authorRevenue) {
      res.status(404).json({message:"No Revenue Found"})
    }

    const { totalMonthlyRevenue, totalYearlyRevenue } = await calculateTotalMonthlyAndYearlyRevenue(userId);
    totalRevenue = totalRevenue === 0 ? await calculateTotalRevenue(userId) : totalRevenue;

    authorRevenue.totalRevenue = totalRevenue;
    authorRevenue.currentMonthRevenue = totalMonthlyRevenue;
    authorRevenue.currentYearRevenue = totalYearlyRevenue;

    const report = await authorRevenue.save();

    res.status(200).json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

const calculateTotalRevenue = async (authorId) => {
  console.log("calculating total revenue...");
  const books = await BookModel.find({ authors: authorId });
  return books.reduce((acc, book) => acc + (book.sellCount * book.price), 0);
};

const bookUrlGenerator = async (req, res) => {
  try {
    const { slug } = req.params; // Extracting the slug from req.params
    const book = await BookModel.findOne({ slug }); // Find the book by slug
    if (!book) {
      // If book not found, return an error response
      return res.status(404).json({ error: 'Book not found' });
    }
    // If book found, return the book data
    res.status(200).json({title:book.title,description:book.description,price:book.price});
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = launchBook;

module.exports = {
  launchBook,
  getBookForAuthor,
  getAuthorRevenue,
  bookUrlGenerator
};
