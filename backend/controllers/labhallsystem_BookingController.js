const Booking = require('../models/labhallsystem_Booking');
const Room = require('../models/labhallsystem_Room');
const crypto = require('crypto');

exports.createBooking = async (req, res) => {
    const { roomId, date, startTime, endTime, recurrence, recurrenceWeeks = 12 } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.status === 'maintenance') return res.status(400).json({ message: 'Room is currently under maintenance' });

        const bookingsToCreate = [];
        const recurrenceGroupId = recurrence === 'weekly' ? crypto.randomBytes(8).toString('hex') : null;
        const numInstances = recurrence === 'weekly' ? recurrenceWeeks : 1;

        for (let i = 0; i < numInstances; i++) {
            const bookingDate = new Date(date);
            bookingDate.setDate(bookingDate.getDate() + (i * 7));

            // Check for double booking
            const overlap = await Booking.findOne({
                roomId,
                date: bookingDate,
                status: { $ne: 'cancelled' },
                $or: [
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gt: startTime }
                    }
                ]
            });

            if (overlap) {
                return res.status(400).json({ 
                    message: `Conflict detected on week ${i + 1} (${bookingDate.toDateString()}). Series not created.` 
                });
            }

            bookingsToCreate.push({
                userId: req.user._id,
                roomId,
                date: bookingDate,
                startTime,
                endTime,
                lecturerName: req.user.name,
                recurrence,
                recurrenceGroupId
            });
        }

        const savedBookings = await Booking.insertMany(bookingsToCreate);
        res.status(201).json(savedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('roomId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const total = await Booking.countDocuments();
        const confirmed = await Booking.countDocuments({ status: 'confirmed' });
        const cancelled = await Booking.countDocuments({ status: 'cancelled' });
        
        // Group by day of week
        const byDay = await Booking.aggregate([
            { $group: { _id: { $dayOfWeek: "$date" }, count: { $sum: 1 } } }
        ]);

        res.json({ total, confirmed, cancelled, byDay });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { updateSeries } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (updateSeries && booking.recurrenceGroupId) {
            await Booking.updateMany(
                { recurrenceGroupId: booking.recurrenceGroupId, date: { $gte: booking.date } },
                { $set: req.body }
            );
            return res.json({ message: 'Recurrence series updated' });
        }

        Object.assign(booking, req.body);
        const updated = await booking.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { deleteSeries } = req.query;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (deleteSeries === 'true' && booking.recurrenceGroupId) {
            await Booking.deleteMany({ recurrenceGroupId: booking.recurrenceGroupId });
            return res.json({ message: 'Recurrence series deleted' });
        }

        await booking.deleteOne();
        res.json({ message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
