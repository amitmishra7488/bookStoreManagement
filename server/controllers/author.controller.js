const AuthorRevenueModel = require("../models/authorRevenueModel");
const BookModel = require("../models/book.models");
const UserModel = require("../models/user.model");
const calculateTotalMonthlyAndYearlyRevenue = require("../utils/monthlyAndYearlyRevenue");

const launchBook = async (req, res) => {
  try {
    const { title, description, price, additionalAuthors } = req.body;
    const firstAuthor = req.userId; // Extract first author ID from req.userId

    // Combine the first author ID with additional author IDs
    let authors = [firstAuthor];
    if (additionalAuthors) {
      authors = [firstAuthor, ...additionalAuthors];
    }
    console.log(additionalAuthors);
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


    res.status(201).json({ message: "Book added successfully", book: newBook });
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

const bookLaunchNotification = async (req, res) => {
  try {
      const { message } = req.body;
      const allUsers = await UserModel.find();

      const batchSize = 2;
      const batches = [];
      for (let i = 0; i < allUsers.length; i += batchSize) {
          batches.push(allUsers.slice(i, i + batchSize));
      }

      // Send emails in batches with a delay of 25 seconds
      for (let batch of batches) {
          await sendEmailsWithDelay(message, batch);
          await new Promise(resolve => setTimeout(resolve, 30000)); // Delay for 25 seconds (25 seconds * 1000 milliseconds)
      }

      res.status(200).json("Notification Successfully Sent to all User");
  } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendEmailsWithDelay(message, users) {
  try {
      console.log(message, "sent to -->", users.map(user => user.email));
  } catch (error) {
      console.error('Error sending emails:', error);
  }
}




module.exports = launchBook;

module.exports = {
  launchBook,
  getBookForAuthor,
  getAuthorRevenue,
  bookLaunchNotification
};
