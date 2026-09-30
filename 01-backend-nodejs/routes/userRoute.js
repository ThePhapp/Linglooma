const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwtauth = require('../middleware/jwtauth');

router.put('/update', jwtauth, userController.updateUserController);
router.get('/account', jwtauth, userController.getAccountController);

module.exports = router;
