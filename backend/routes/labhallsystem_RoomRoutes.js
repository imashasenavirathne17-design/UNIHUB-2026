const express = require('express');
const router = express.Router();
const { 
    seedRooms, 
    getAllRooms, 
    getRoomsByFloor, 
    getRoomsByFloorAndType, 
    updateRoom, 
    getRoomStats 
} = require('../controllers/labhallsystem_RoomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/seed', protect, seedRooms);
router.get('/', protect, getAllRooms);
router.get('/stats', protect, getRoomStats);
router.get('/floor/:floor', protect, getRoomsByFloor);
router.get('/floor/:floor/type/:type', protect, getRoomsByFloorAndType);
router.put('/:id', protect, updateRoom);

module.exports = router;
