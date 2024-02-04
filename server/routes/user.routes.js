const express = require('express');
const router = express.Router();
const { registerTempUser, registerVerifiedUser, createRoleChangeRequest, login, bookPurchase } = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth');

// All User Account Related Routes
router.post('/register', registerTempUser);
router.post('/verify-user',registerVerifiedUser);
router.post('/login', login );
router.post('/roleChange-request', auth , createRoleChangeRequest);


// Book Purchase routes
router.post('/buy-book/:bookID', auth, bookPurchase);


module.exports = router;