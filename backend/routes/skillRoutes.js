const express = require('express');
const router = express.Router();
const {
    getMySkillProfile,
    updateSkillProfile,
    createGig,
    updateGig,
    deleteGig,
    getSkillMarketplace,
    submitReview,
    createOrder,
    getMyOrders,
    updateOrderStatus
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSkillMarketplace);
router.get('/me', protect, getMySkillProfile);
router.put('/me', protect, updateSkillProfile);
router.post('/review', protect, submitReview);
router.post('/order', protect, createOrder);
router.get('/orders/me', protect, getMyOrders);
router.patch('/order/:id/status', protect, updateOrderStatus);

// Gig CRUD
router.post('/gigs', protect, createGig);
router.put('/gigs/:id', protect, updateGig);
router.delete('/gigs/:id', protect, deleteGig);

module.exports = router;
