# Backend Component
## Overview
This is the backend component of our project, responsible for handling server-side logic, database interactions, and API endpoints.

## Hosted Location

The backend is hosted at [BookStore👆](https://book-store-management-kappa.vercel.app/) .

## Functionalities

The backend provides the following functionalities:
- Server-side logic execution
- Database interactions with MongoDB
- API endpoints for client-server communication

## Main Routes

The main routes of the backend are as follows:

- `/user`: Routes related to user authentication and user-specific operations.
- `/admin`: Routes for admin-related functionalities and operations.
- `/author`: Routes for author-specific functionalities and operations.

# Middleware

Middleware functions in the backend are used to intercept incoming HTTP requests and perform operations such as authentication, authorization, and request processing. Here are the middleware functions used in our project:

## Authentication Middleware

The `auth` middleware function is responsible for authenticating incoming requests using JSON Web Tokens (JWT). It verifies the token provided in the request headers and sets the authenticated user's ID in the request object for further processing.

## Authorization Middleware

Authorization middleware functions, such as `isAdmin` and `isAuthor`, are used to restrict access to certain routes based on user roles.<br>
For example, `isAdmin` ensures that only admin users can access specific routes, while `isAuthor` restricts access to routes specific to authors.

- **isAdmin**: Ensures that the user is an admin before allowing access to certain routes.
- **isAuthor**: Restricts access to routes specific to authors, ensuring that the user is authorized as an author.

## Usage

To use these middleware functions in your routes, simply import them and include them as route handlers before the actual route logic. For example:

```javascript
const express = require('express');
const { auth, isAdmin, isAuthor } = require('./middleware/auth');

const router = express.Router();

// Protected route accessible only to authenticated users
router.get('/protected', auth, (req, res) => {
  res.send('Protected route');
});

// Admin-only route
router.get('/admin', auth, isAdmin, (req, res) => {
  res.send('Admin route');
});

// Author-only route
router.get('/author', auth, isAuthor, (req, res) => {
  res.send('Author route');
});

module.exports = router;
```

# Routes Used In Project

# User Routes
## Overview
User routes handle various user-related operations such as registration, login, and role change requests.

## Functionalities
- **Register Temporary User**: Endpoint for registering temporary users.
- **Verify User**: Endpoint for verifying registered users.
- **Login**: Endpoint for user authentication and login.
- **Role Change Request**: Endpoint for submitting requests to change user roles.

## Route Details
### Register Temporary User
- **Method**: POST
- **Path**: `/register`
- **Middleware**: None
- **Controller**: `registerTempUser`

### Verify User
- **Method**: POST
- **Path**: `/verify-user`
- **Middleware**: None
- **Controller**: `registerVerifiedUser`

### Login
- **Method**: POST
- **Path**: `/login`
- **Middleware**: None
- **Controller**: `login`

### Role Change Request
- **Method**: POST
- **Path**: `/roleChange-request`
- **Middleware**: `auth`
- **Controller**: `createRoleChangeRequest`

# Author Routes
## Overview
Author routes handle operations related to authors, such as book launching, revenue calculation, and notifications.

## Functionalities
- **Launch Book**: Endpoint for authors to launch their books and notify all user about book launch.
- **Get Books**: Endpoint for authors to retrieve their books.
- **Author Revenue**: Endpoint for authors to view their revenue.
- **Notify All Users**: Endpoint for sending book launch notifications to all users.
- **Book URL Generator**: Endpoint for generating book URLs.

## Route Details
### Launch Book
- **Method**: POST
- **Path**: `/add-book`
- **Middleware**: `auth`, `isAuthor`
- **Controller**: `launchBook`

### Get Books
- **Method**: GET
- **Path**: `/get-books`
- **Middleware**: `auth`, `isAuthor`
- **Controller**: `getBookForAuthor`

### Author Revenue
- **Method**: GET
- **Path**: `/author-revenue`
- **Middleware**: `auth`, `isAuthor`
- **Controller**: `getAuthorRevenue`


### Book URL Generator
- **Method**: GET
- **Path**: `/:slug`
- **Middleware**: None
- **Controller**: `bookUrlGenerator`

# Admin Routes
## Overview
Admin routes handle operations specific to admin users, such as processing role change requests.

## Functionalities
- **Update Role**: Endpoint for updating user roles based on role change requests.

## Route Details
### Update Role
- **Method**: PUT
- **Path**: `/update-role/:id`
- **Middleware**: `auth`, `isAdmin`
- **Controller**: `processRoleChangeRequest`

# Bulk Email Notification Feature

## Overview
The bulk email notification feature allows sending notifications to all retail users about new book releases. To prevent overwhelming the email server and to comply with service provider limits, the feature implements a batching mechanism where emails are sent in batches with a delay between each batch.

## Implementation Details
The implementation of the bulk email notification feature involves the following steps:

1. **Fetch All Users**: Fetch all retail users from the database using the UserModel.
2. **Batching Users**: Divide the list of users into smaller batches to send emails in manageable chunks. The batch size is configured to limit the number of emails sent simultaneously.
3. **Sending Emails with Delay**: Iterate through each batch of users and send emails with a delay between each batch. This delay ensures that the email server is not overloaded and complies with the service provider's rate limits.
4. **Handling Rate Limit**: To prevent exceeding the service provider's rate limit, the feature sends emails in batches and waits for a specified delay between each batch. In this implementation, a delay of 60 seconds (1 minute) is used between batches to send up to batchSize emails.

## Code Snippet
```javascript
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
    console.log(message, "sent to -->", users.map((user) => user.email));
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

module.exports = {
  bookLaunchNotification
};
```

# Book Purchase Function

This function handles the purchase of a book, updating relevant data in the database and sending email notifications to authors about the revenue generated.

## Input Parameters
- `req`: Request object containing information about the purchase request.
- `res`: Response object for sending HTTP responses.

## Steps
1. **Start Transaction**: Begin a session and start a transaction.
2. **Request Data**: Retrieve necessary data from the request object (`quantity`, `bookID`, `userId`).
3. **Validate Quantity**: Check if the quantity is a positive integer.
4. **Verify Book Existence**: Check if the requested book exists in the database.
5. **Calculate Total Price**: Calculate the total price of the purchase.
6. **Update Book Data**: Increment `sellCount` of Book.
7. **Generate Purchase ID**: Generate a unique purchase ID based on the current date and existing purchase count.
8. **Create Purchase History**: Save a new purchase history record in the database.
9. **Commit Transaction**: Commit the transaction to save changes permanently.
10. **Update Author Revenue**: Iterate over each author of the purchased book, calculate their total revenue, and update their revenue records.
11. **Send Email Notifications**: Send email notifications to authors about the revenue generated.
12. **Handle Errors**: Handle any errors that occur during the process, retrying the transaction in case of a write conflict error.

## Error Handling
- If a write conflict error occurs, the transaction is retried.
- Other errors lead to aborting the transaction and returning an internal server error response.

## Response
- If successful, returns a 200 status with a success message and details of the purchase.
- In case of errors, returns an appropriate error status with error details.


# Revenue Calculation Logic

### Overview
The revenue calculation logic is a crucial component of the book purchasing system, responsible for computing the total monthly and yearly revenue generated by an author's book sales. This logic enables tracking and analyzing an author's earnings over time.

### Implementation Details
The revenue calculation logic follows these main steps:

1. **Date Range Setup**: Determine the start and end dates for the current month and year to filter purchase records within these timeframes.

2. **Aggregate Purchase Records**: Utilize MongoDB aggregation pipeline to aggregate purchase history records. The pipeline stages include filtering purchases by the author's ID and purchase date range.

3. **Calculate Total Revenue**: Within the aggregation pipeline, calculate the total revenue for the current month, current year, and overall. This calculation involves summing up the prices of book purchases made by the author within each specified timeframe.

4. **Return Results**: Return the total revenue values for the current month, current year, and overall as an object containing respective totals.

### Code Snippet
```javascript
async function calculateTotalRevenueForAuthor(authorId) {
  try {
    // Determine date ranges for current month and year
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

    // Aggregate purchase history records
    const totalRes = await PurchaseHistoryModel.aggregate([
      // Pipeline stages for calculating total revenue
      {
        $facet: {
          totalValueOverall: [
            // Match purchases by author ID
            {
              $match: { "book.authors": authorId }
            },
            // Group and calculate total revenue for all purchases
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }
              }
            }
          ],
          totalValueCurrentMonth: [
            // Match purchases within current month by author ID
            {
              $match: {
                "book.authors": authorId,
                purchaseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
              }
            },
            // Group and calculate total revenue for current month purchases
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }
              }
            }
          ],
          totalValueCurrentYear: [
            // Match purchases within current year by author ID
            {
              $match: {
                "book.authors": authorId,
                purchaseDate: { $gte: firstDayOfYear, $lte: lastDayOfYear }
              }
            },
            // Group and calculate total revenue for current year purchases
            {
              $group: {
                _id: null,
                totalValue: { $sum: "$price" }
              }
            }
          ]
        }
      }
    ]);

    return totalRes[0]; // Return total revenue values
  } catch (error) {
    throw new Error(`Error calculating total revenue for author: ${error.message}`);
  }
}

```
