const express = require('express');
const router = express.Router();
const { login } = require('../controllers/labhallsystem_AuthController');

router.post('/login', login);

module.exports = router;
