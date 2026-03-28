const User = require('../models/User'); // Use original User model but add domain logic
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Validate domain for the intended use case
        const isStudent = email.endsWith('@gmail.com');
        const isLecturer = email.endsWith('@my.sliit.lk');

        if (!isStudent && !isLecturer) {
            return res.status(403).json({ message: 'Unauthorized email domain for this system' });
        }

        // Ensure role matches domain (security check)
        if (isStudent && user.role !== 'student') {
             return res.status(403).json({ message: 'Role mismatch for student domain' });
        }
        if (isLecturer && user.role !== 'lecturer') {
             return res.status(403).json({ message: 'Role mismatch for lecturer domain' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
