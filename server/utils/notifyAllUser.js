const UserModel = require("../models/user.model");

const bookLaunchNotification = async (message) => {
  try {
    const allUsers = await UserModel.find();

    const batchSize = 2;
    const batches = [];
    for (let i = 0; i < allUsers.length; i += batchSize) {
      batches.push(allUsers.slice(i, i + batchSize));
    }

    // Send emails in batches with a delay of 1 minute
    for (let batch of batches) {
      await sendEmailsWithDelay(message, batch);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Delay for 25 seconds (25 seconds * 1000 milliseconds)
    }

    return { message: "Mail Sent To All Users Successfully" };
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

async function sendEmailsWithDelay(message, users) {
  try {
    console.log(
      message,
      "sent to -->",
      users.map((user) => user.email)
    );
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}


module.exports = {
    bookLaunchNotification
}
