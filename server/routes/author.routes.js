const express = require('express');
const { isAuthor, auth } = require('../middlewares/auth');
const { launchBook, getBookForAuthor, getAuthorRevenue, bookLaunchNotification } = require('../controllers/author.controller');
const router = express.Router();


router.post('/add-book', auth, isAuthor, launchBook);
router.get('/get-books', auth ,isAuthor, getBookForAuthor);
router.get('/author-revenue', auth, isAuthor, getAuthorRevenue);

router.post('/notify-alluser', bookLaunchNotification);


module.exports = router;