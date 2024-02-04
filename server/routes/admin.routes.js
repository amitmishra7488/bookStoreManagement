const express = require('express');
const { auth, isAdmin } = require('../middlewares/auth');
const { processRoleChangeRequest } = require('../controllers/admin.controller');
const router = express.Router();


router.put('/update-role/:id',auth , isAdmin, processRoleChangeRequest );

module.exports = router;