const express = require('express');
const router = express.Router();
const { registerTempUser, registerVerifiedUser, createRoleChangeRequest, login, bookPurchase } = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth');
const { bookLaunchNotification } = require('../utils/notifyAllUser');

// All User Account Related Routes
router.post('/register', registerTempUser);
router.post('/verify-user',registerVerifiedUser);
router.post('/login', login );
router.post('/roleChange-request', auth , createRoleChangeRequest);


// Book Purchase routes
router.post('/buy-book/:bookID', auth, bookPurchase);

router.get('/notify', async(req,res)=>{
    try {
        const message = "New Book Launched"
        await bookLaunchNotification(message)
        res.status(200).json("response sent......")
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;