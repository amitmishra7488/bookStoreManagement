const PurchaseHistoryModel = require("../models/purchaseHistory.model");

async function calculateTotalRevenueForAuthor(authorId) {
  console.log("running book purchase");
  try {
    // Get the current month and year
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

    const totalRes = await PurchaseHistoryModel.aggregate([
      // Pipeline stage to calculate the total value of purchases overall
      {
        $facet: {
          totalValueOverall: [
            {
              $lookup: {
                from: "books",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: "$book",
            },
            {
              $match: {
                "book.authors":authorId,
              },
            },
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }, // Summing up the price field directly
              },
            },
          ],
          totalValueCurrentMonth: [
            {
              $match: {
                purchaseDate: {
                  $gte: firstDayOfMonth,
                  $lte: lastDayOfMonth,
                },
              },
            },
            {
              $lookup: {
                from: "books",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: "$book",
            },
            {
              $match: {
                "book.authors": authorId,
              },
            },
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }, // Summing up the price field directly
              },
            },
          ],
          totalValueCurrentYear: [
            {
              $match: {
                purchaseDate: {
                  $gte: firstDayOfYear,
                  $lte: lastDayOfYear,
                },
              },
            },
            {
              $lookup: {
                from: "books",
                localField: "bookId",
                foreignField: "_id",
                as: "book",
              },
            },
            {
              $unwind: "$book",
            },
            {
              $match: {
                "book.authors": authorId,
              },
            },
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }, // Summing up the price field directly
              },
            },
          ],
        },
      },
    ]);

    console.log("totalmerge", totalRes[0]);
    return totalRes[0];
  } catch (error) {
    throw new Error(
      `Error calculating total revenue for author: ${error.message}`
    );
  }
}

module.exports = calculateTotalRevenueForAuthor;
  
