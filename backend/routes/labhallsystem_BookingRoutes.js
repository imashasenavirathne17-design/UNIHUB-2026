const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getAllBookings, 
    updateBooking, 
    deleteBooking, 
    getStats 
} = require('../controllers/labhallsystem_BookingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getStats);

router.route('/')
    .get(protect, getAllBookings)
    .post(protect, createBooking);

router.route('/:id')
    .put(protect, updateBooking)
    .delete(protect, deleteBooking);

module.exports = router;
