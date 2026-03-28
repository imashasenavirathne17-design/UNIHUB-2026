const Room = require('../models/labhallsystem_Room');

// Seed Rooms based on university structure
// Floors 1-7. 5 halls per floor, except 4th floor (3 labs, 1 hall).
exports.seedRooms = async (req, res) => {
    try {
        const { reset } = req.body;
        if (reset) {
            await Room.deleteMany({});
        } else {
            const count = await Room.countDocuments();
            if (count > 0) {
                return res.status(400).json({ message: 'Rooms already seeded. Use reset to re-initialize.' });
            }
        }

        const rooms = [];
        for (let f = 1; f <= 7; f++) {
            if (f >= 1 && f <= 3) {
                // 5 lecture halls
                for (let h = 1; h <= 5; h++) {
                    rooms.push({ name: `L${f}0${h}`, type: 'hall', floor: f });
                }
            } else if (f === 4) {
                // 4 labs, 1 hall
                rooms.push({ name: `B401`, type: 'lab', floor: 4 });
                rooms.push({ name: `B402`, type: 'lab', floor: 4 });
                rooms.push({ name: `B403`, type: 'lab', floor: 4 });
                rooms.push({ name: `B404`, type: 'lab', floor: 4 });
                rooms.push({ name: `L405`, type: 'hall', floor: 4 });
            } else if (f >= 5 && f <= 7) {
                // 4 lecture halls
                for (let h = 1; h <= 4; h++) {
                    rooms.push({ name: `L${f}0${h}`, type: 'hall', floor: f });
                }
            }
        }

        await Room.insertMany(rooms);
        res.status(201).json({ message: 'Campus rooms seeded successfully', count: rooms.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ floor: 1, name: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoomsByFloor = async (req, res) => {
    try {
        const rooms = await Room.find({ floor: req.params.floor }).sort({ name: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoomsByFloorAndType = async (req, res) => {
    try {
        const { floor, type } = req.params;
        const rooms = await Room.find({ floor, type }).sort({ name: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        Object.assign(room, req.body);
        const updated = await room.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoomStats = async (req, res) => {
    try {
        const total = await Room.countDocuments();
        const maintenance = await Room.countDocuments({ status: 'maintenance' });
        const labs = await Room.countDocuments({ type: 'lab' });
        const halls = await Room.countDocuments({ type: 'hall' });
        
        res.json({ total, maintenance, labs, halls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
