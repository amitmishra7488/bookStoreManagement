const PurchaseHistoryModel = require("../models/purchaseHistory.model");

const calculateTotalMonthlyAndYearlyRevenue = async (authorId) => {
    console.log("calculating monthly and yearly revenue...");
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
  
    const firstDayOfMonth = new Date(todayYear, todayMonth, 1);
    const lastDayOfMonth = new Date(todayYear, todayMonth + 1, 0);
    const firstDayOfYear = new Date(todayYear, 0, 1);
    const lastDayOfYear = new Date(todayYear, 11, 31);
  
    try {
      // Find purchases made within the current month
      const purchasesThisMonth = await PurchaseHistoryModel.find({
        purchaseDate: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth
        }
      }).populate({
        path: 'bookId',
        populate: {
          path: 'authors'
        }
      });
  
      // Find purchases made within the current year
      const purchasesThisYear = await PurchaseHistoryModel.find({
        purchaseDate: {
          $gte: firstDayOfYear,
          $lte: lastDayOfYear
        }
      }).populate({
        path: 'bookId',
        populate: {
          path: 'authors'
        }
      });
  
      // Calculate total revenue from purchases made this month
      const totalMonthlyRevenue = purchasesThisMonth.reduce((acc, purchase) => {
        // Check if the book's authors include the specified authorId
        const bookAuthors = purchase.bookId.authors.map(author => author._id.toString());
        if (bookAuthors.includes(authorId)) {
          return acc + purchase.price;
        }
        return acc;
      }, 0);
  
      // Calculate total revenue from purchases made this year
      const totalYearlyRevenue = purchasesThisYear.reduce((acc, purchase) => {
        // Check if the book's authors include the specified authorId
        const bookAuthors = purchase.bookId.authors.map(author => author._id.toString());
        if (bookAuthors.includes(authorId)) {
          return acc + purchase.price;
        }
        return acc;
      }, 0);
  
      return { totalMonthlyRevenue, totalYearlyRevenue };
    } catch (error) {
      console.error("Error calculating total monthly/yearly revenue:", error);
      throw error;
    }
  };

  module.exports = calculateTotalMonthlyAndYearlyRevenue;
  