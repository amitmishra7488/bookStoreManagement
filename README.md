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

1. **Retrieve All Users**: Fetch all retail users from the database using the UserModel.

2. **Batching Users**: Divide the list of users into smaller batches to send emails in manageable chunks. The batch size is configured to limit the number of emails sent simultaneously.

3. **Sending Emails with Delay**: Iterate through each batch of users and send emails with a delay between each batch. This delay ensures that the email server is not overloaded and complies with the service provider's rate limits.

4. **Handling Rate Limit**: To prevent exceeding the service provider's rate limit, the feature sends emails in batches and waits for a specified delay between each batch. In this implementation, a delay of 60 seconds (1 minute) is used between batches to send up to 100 emails.

## Code Snippet
```javascript
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
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Delay for 60 seconds (60 seconds * 1000 milliseconds)
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
};
```
# Revenue Calculation Logic
## Overview
The revenue calculation logic is responsible for computing the total monthly and yearly revenue generated from book purchases by an author. This logic is utilized after each book purchase to update the author's revenue records and send notifications accordingly.

## Implementation Details
The revenue calculation logic involves the following steps:

1. **Fetching Purchase History**: Retrieve purchase history records for the current month and year from the PurchaseHistoryModel.

2. **Calculating Total Revenue**: Calculate the total revenue generated by summing up the prices of all book purchases made by the author within the current month and year.

3. **Updating Author's Revenue**: Update the author's revenue records in the AuthorRevenueModel with the total revenue, current month revenue, and current year revenue.

4. **Sending Email Notification**: Send an email notification to the author, informing them about the revenue generated from book purchases.

## Code Snippet
```javascript
const calculateTotalMonthlyAndYearlyRevenue = async (authorId) => {
  try {
    // Fetch purchases made within the current month
    const purchasesThisMonth = await PurchaseHistoryModel.find({
      purchaseDate: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });

    // Fetch purchases made within the current year
    const purchasesThisYear = await PurchaseHistoryModel.find({
      purchaseDate: {
        $gte: firstDayOfYear,
        $lte: lastDayOfYear
      }
    });

    // Calculate total revenue from purchases made this month
    const totalMonthlyRevenue = purchasesThisMonth.reduce((acc, purchase) => {
      if (purchase.bookId.authors.includes(authorId)) {
        return acc + purchase.price;
      }
      return acc;
    }, 0);

    // Calculate total revenue from purchases made this year
    const totalYearlyRevenue = purchasesThisYear.reduce((acc, purchase) => {
      if (purchase.bookId.authors.includes(authorId)) {
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
```
## Calculating Total Revenue
The total revenue is updated by summing up the prices of current book purchase made by the user with the last total revenue.
