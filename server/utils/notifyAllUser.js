const UserModel = require("../models/user.model");
const cron = require("node-cron");

const bookLaunchNotification = async (message) => {
  try {
    const allUsers = await UserModel.find();
    const batchSize = 2;
    const batches = [];
    for (let i = 0; i < allUsers.length; i += batchSize) {
      batches.push(allUsers.slice(i, i + batchSize));
    }

    let currentBatchIndex = 0;
    if (currentBatchIndex === 0) {
      sendEmailsWithDelay(message, batches[currentBatchIndex]);
      currentBatchIndex++;
    }

    const cronJob = cron.schedule("* * * * *", () => {
      const currentBatch = batches[currentBatchIndex];
      if (currentBatch) {
        sendEmailsWithDelay(message, currentBatch);
        currentBatchIndex++;
      } else {
        cronJob.stop(); 
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
      message,"sent to -->",users.map((user) => user.email)
    );
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

module.exports = {
  bookLaunchNotification,
};
