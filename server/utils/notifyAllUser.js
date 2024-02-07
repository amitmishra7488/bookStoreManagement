const UserModel = require("../models/user.model");
const cron = require("node-cron");

let allUsers = null;

const fetchAllUsers = async () => {
  console.log("Fetching all users from the database...");
  allUsers = await UserModel.find();
};

const bookLaunchNotification = async (message) => {
  try {
    // Fetch all users if not already fetched
    if (!allUsers) {
      await fetchAllUsers();
    }

    const batchSize = 2;
    const batches = [];
    for (let i = 0; i < allUsers.length; i += batchSize) {
      batches.push(allUsers.slice(i, i + batchSize));
    }

    let currentBatchIndex = 0;

    // Send emails for the first batch immediately
    sendEmailsWithDelay(message, batches[currentBatchIndex]);
    currentBatchIndex++;

    // Schedule cron job to send emails for remaining batches
    const cronJob = cron.schedule("* * * * *", () => {
      const currentBatch = batches[currentBatchIndex];
      if (currentBatch) {
        sendEmailsWithDelay(message, currentBatch);
        currentBatchIndex++;
      } else {
        cronJob.stop(); // Stop cron job when all batches are processed
      }
    });

    return { message: "Mail Sent To All Users Successfully" };
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendEmailsWithDelay = (message, users) => {
  try {
    console.log(
      message,
      "sent to -->",
      users.map((user) => user.email)
    );
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

module.exports = {
  bookLaunchNotification
};

