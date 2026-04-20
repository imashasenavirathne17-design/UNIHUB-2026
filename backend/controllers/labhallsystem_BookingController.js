const Booking = require('../models/labhallsystem_Booking');
const Room = require('../models/labhallsystem_Room');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

        // Send Email Confirmation to Lecturer
        const lecturer = await User.findById(req.user._id);
        if (lecturer) {
            await sendEmail({
                email: lecturer.email,
                subject: `UniHub Booking Confirmed: ${room.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #14B8A6; padding: 20px; text-align: center; color: white;">
                            <h2 style="margin: 0;">Facility Booking Verified</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hello Prof. ${lecturer.name},</p>
                            <p>Your reservation for the <b>${room.name}</b> has been mathematically verified and successfully logged onto the campus network.</p>
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0 0 5px 0;"><b>START DATE:</b> ${new Date(date).toDateString()}</p>
                                <p style="margin: 0 0 5px 0;"><b>TIME BLOCK:</b> ${startTime} to ${endTime}</p>
                                ${recurrence === 'weekly' ? `<p style="margin: 0; color: #14B8A6; font-weight: bold;">[RECURRING SCHEDULE] Active for ${recurrenceWeeks} weeks</p>` : ''}
                            </div>
                            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">If you cancel this class, please release the room through your unified dashboard.</p>
                        </div>
                    </div>
                `
            });
        }

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
