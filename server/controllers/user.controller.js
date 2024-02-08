const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const TempUserModel = require("../models/tempUser.model");
const { sendEmail } = require("../utils/mailer");
const { generateOtp } = require("../utils/generateOtp");
const UserModel = require("../models/user.model");
const RoleChangeRequestModel = require("../models/roleChangeRequest.model");
const BookModel = require("../models/book.models");
const PurchaseHistoryModel = require("../models/purchaseHistory.model");
const AuthorRevenueModel = require("../models/authorRevenueModel");
const calculateTotalMonthlyAndYearlyRevenue = require("../utils/monthlyAndYearlyRevenue");
const mongoose = require('mongoose');
// User Registeration
const registerTempUser = async (req, res) => {
  try {
    // Extract user data from request body
    const { name, email, password } = req.body;

    // Check if the name or email already exists in the temporary users database
    const tempExistingUser = await TempUserModel.findOne({ email });
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send(`User already existsed for email  ${email}`);
    }
    if (tempExistingUser) {
      const currentTime = new Date();
      const resendWindow = 15 * 60 * 1000;

      if (currentTime - tempExistingUser.createdAt < resendWindow) {
        const timeRemaining = Math.ceil(
          (tempExistingUser.createdAt.getTime() +
            resendWindow -
            currentTime.getTime()) /
          (60 * 1000)
        );

        return res.status(201).json({
          message:
            "OTP Already Sent. Please enter the last OTP. It will expire in " +
            timeRemaining +
            " minutes.",
        });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const newTempUser = new TempUserModel({
      name,
      email,
      password: hashedPassword,
      otp: otp
    });

    await sendEmail(
      email,
      name,
      `Your OTP is: ${otp}`,
      "Account Registration"
    );
    await newTempUser.save();

    res
      .status(201)
      .json({
        message: "Temporary user created successfully",
        tempUser: newTempUser,
      });
  } catch (error) {
    console.error("Error registering tempUser:", error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// User Email Verification
const registerVerifiedUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the tempUser by email
    const tempUser = await TempUserModel.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Verify OTP
    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if the user already exists in the regular user collection
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const newUser = new UserModel({
      name: tempUser.name,
      email: email,
      password: tempUser.password,
    });
    const createduser = await newUser.save();

    // Delete the tempUser document
    await TempUserModel.findOneAndDelete({ email });

    // Respond with success message and user details
    res.status(201).json({
      user: { name: createduser.name, email: createduser.email },
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// User Login 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const expiresIn = "1h";
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn,
    });
    res
      .status(200)
      .json({ message: "Login successful", user: user, token: token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// User role change request
const createRoleChangeRequest = async (req, res) => {
  try {
    // Extract requestedTo email and requestedRole from the request body
    const { requestedToEmail, requestedRole } = req.body;

    // Find the user by email
    const requestedToUser = await UserModel.findOne({ email: requestedToEmail });
    if (!requestedToUser) {
      return res.status(404).json({ error: 'Requested user not found' });
    }
    if (requestedToUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin users can perform this action so send your request only to admin' });
    }

    // Extract requestedBy ID from the JWT token
    const existedRequest = await RoleChangeRequestModel.findOne({ requestedBy: req.userId });
    if (existedRequest) {
      return res.status(400).json({ error: 'Request Already Sent , Contact Admin or Request After 7 days' });
    }
    const requestedBy = req.userId;
    // Create a new role change request
    const roleChangeRequest = new RoleChangeRequestModel({
      requestedTo: requestedToUser._id,
      requestedRole,
      requestedBy,
    });
    await roleChangeRequest.save();

    res.status(201).json({ message: 'Role change request submitted successfully' });
  } catch (error) {
    console.error('Error creating role change request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Book Purchase 
// const bookPurchase = async (req, res) => {
//   try {
//     const { quantity } = req.body;
//     const bookID = req.params.bookID;
//     const userId = req.userId;

//     // Validate quantity
//     if (!Number.isInteger(quantity) || quantity <= 0) {
//       return res.status(400).json({ error: "Invalid quantity" });
//     }

//     // Verify if the requested book exists
//     const existedBook = await BookModel.findById(bookID);
//     if (!existedBook) {
//       return res.status(400).json({ error: "Book doesn't exist" });
//     }

//     // Check if requested quantity is available
//     if (existedBook.quantityAvailable < quantity) {
//       return res.status(400).json({ error: "Requested quantity not available" });
//     }

//     // Calculate total price
//     const totalPrice = existedBook.price * quantity;

//     // Update sellCount of the book and decrease quantityAvailable
//     existedBook.sellCount += quantity;
//     await existedBook.save();
//     // Create a new purchase history record
//     const newPurchase = new PurchaseHistoryModel({
//       bookId: bookID,
//       userId: userId,
//       purchaseDate: new Date(),
//       price: totalPrice,
//       quantity: quantity
//     });
//     await newPurchase.save();


//     // Iterate over each author's ID in existedBook.authors
//     for (const authorId of existedBook.authors) {
//       // Find the total monthly revenue for the author
//       const { totalMonthlyRevenue, totalYearlyRevenue } = await calculateTotalMonthlyAndYearlyRevenue(authorId.toString());

//       // Find the author's revenue
//       const authorRevenue = await AuthorRevenueModel.findOneAndUpdate(
//         { author: authorId },
//         {
//           $inc: {
//             totalRevenue: totalPrice,
//           },
//           $set: {
//             currentMonthRevenue: totalMonthlyRevenue,
//             currentYearRevenue: totalYearlyRevenue
//           }
//         },
//         { new: true, upsert: true }
//       );
//       const authorDetails = await UserModel.findById(authorId);

//       const allDetails = { authorRevenue, newPurchase };

//       // Send email
//       await sendEmail(authorDetails.email, authorDetails.name, allDetails, "Revenue Generated");
//       console.log(`Updated revenue for author ${authorId}:`, authorRevenue);
//     }

//     res.status(200).json({
//       message: "Book purchased successfully",
//       purchase: newPurchase
//     });
//   } catch (error) {
//     console.error("Error purchasing book:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const bookPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { quantity } = req.body;
    const bookID = req.params.bookID;
    const userId = req.userId;

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // Verify if the requested book exists
    const existedBook = await BookModel.findById(bookID).session(session);
    if (!existedBook) {
      return res.status(400).json({ error: "Book doesn't exist" });
    }

    // Check if requested quantity is available
    if (existedBook.quantityAvailable < quantity) {
      return res.status(400).json({ error: "Requested quantity not available" });
    }

    // Calculate total price
    const totalPrice = existedBook.price * quantity;

    // Update sellCount of the book and decrease quantityAvailable
    existedBook.sellCount += quantity;
    await existedBook.save({ session });

    // Generate purchaseId
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const count = await PurchaseHistoryModel.countDocuments().session(session);
    const numericId = count + 1;
    const purchaseId = `${year}-${month}-${numericId}`;

    // Create a new purchase history record
    const newPurchase = new PurchaseHistoryModel({
      purchaseId: purchaseId,
      bookId: bookID,
      userId: userId,
      purchaseDate: currentDate,
      price: totalPrice,
      quantity: quantity
    });
    await newPurchase.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Book purchased successfully",
      purchase: newPurchase
    });
  } catch (error) {
    // Retry transaction on WriteConflict error
    if (error.code === 112) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction aborted due to WriteConflict error, retrying...");
      return bookPurchase(req, res); // Retry the transaction
    }

    // Abort the transaction on other errors
    await session.abortTransaction();
    session.endSession();

    console.error("Error purchasing book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerTempUser,
  registerVerifiedUser,
  login,
  createRoleChangeRequest,
  bookPurchase
};
