const express = require('express');
const router = express.Router();
const controller = require('../controllers/lostfoundController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../utils/lostfoundUpload');

// Item Routes
router.get('/', protect, controller.getAllItems);
router.post('/', protect, upload.single('image'), controller.createItem);
router.get('/:id', protect, controller.getItemById);
router.put('/:id/status', protect, controller.updateItemStatus);
router.delete('/:id', protect, controller.deleteItem);
router.put('/:id/verify-handover', protect, controller.verifyHandover);

// Messaging Routes
router.post('/conversation', protect, controller.createConversation);
router.delete('/conversation/:id', protect, controller.deleteConversation);
router.get('/conversations/all', protect, controller.getConversations);
router.get('/messages/unread/count', protect, controller.getUnreadMessageCount);
router.get('/messages/:conversationId', protect, controller.getMessages);
router.post('/messages', protect, controller.sendMessage);
router.put('/messages/read/:conversationId', protect, controller.markMessagesRead);

module.exports = router;
