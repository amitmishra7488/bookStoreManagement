const UserModel = require("../models/user.model");
const cron = require("node-cron");

let allUsers = null;

const fetchAllUsers = async () => {
  try {
    console.log("Fetching all users from the database...");
    const users = await UserModel.find();
    if (users.length === 0) {
      console.log("No users found in the database.");
      return []; // Return an empty array if no users are found
    }
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Rethrow the error to allow for further error handling
  }
};

const bookLaunchNotification = async (message) => {
  try {
    // Fetch all users if not already fetched
    if (!allUsers) {
      allUsers = await fetchAllUsers();
      if (allUsers.length === 0) {
        console.log("No users found. Skipping notification.");
        return { message: "No users found. Skipping notification." };
      }
    }

    const batchSize = 2;
    const totalBatches = Math.ceil(allUsers.length / batchSize);
    let currentBatchIndex = 0;

    // Send emails for the first batch immediately
    await sendEmails(message, currentBatchIndex, batchSize);

    // Schedule cron job to send emails for remaining batches
    const cronJob = cron.schedule("* * * * *", async () => {
      currentBatchIndex++;
      if (currentBatchIndex < totalBatches) {
        await sendEmails(message, currentBatchIndex, batchSize);
      } else {
        cronJob.stop(); // Stop cron job when all batches are processed
      }
    });

    return { message: "Mail Sent To All Users Successfully" };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

const sendEmails = async (message, batchIndex, batchSize) => {
  try {
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, allUsers.length);
    const batch = allUsers.slice(startIdx, endIdx);

    console.log(
      `${message} sent to -->`,
      batch.map((user) => user.email)
    );

    // Simulate delay for email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Error sending emails:", error);
    // Log the error and continue processing
  }
};

module.exports = {
  bookLaunchNotification
};

