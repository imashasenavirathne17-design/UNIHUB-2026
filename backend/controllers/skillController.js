const SkillProfile = require('../models/SkillProfile');
const Review = require('../models/Review');
const User = require('../models/User');
const Gig = require('../models/Gig');
const SkillOrder = require('../models/SkillOrder');

// @desc    Get own skill profile
// @route   GET /api/skills/me
const getMySkillProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await SkillProfile.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'userId',
                    foreignField: 'targetId',
                    as: 'reviews'
                }
            },
            {
                $project: {
                    userId: 1,
                    bio: 1,
                    githubUrl: 1,
                    linkedinUrl: 1,
                    reviewCount: { $size: '$reviews' },
                    avgRating: { $avg: '$reviews.rating' }
                }
            }
        ]);

        let profile = result[0];
        if (!profile) {
            profile = await SkillProfile.create({ userId });
            profile = { ...profile.toObject(), reviewCount: 0, avgRating: 0 };
        }

        // Also fetch my gigs
        const gigs = await Gig.find({ userId });
        res.json({ ...profile, gigs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update bio/links
// @route   PUT /api/skills/me
const updateSkillProfile = async (req, res) => {
    try {
        const { bio, githubUrl, linkedinUrl } = req.body;
        const profile = await SkillProfile.findOneAndUpdate(
            { userId: req.user._id },
            { bio, githubUrl, linkedinUrl },
            { new: true, upsert: true, runValidators: true }
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new gig
// @route   POST /api/skills/gigs
const createGig = async (req, res) => {
    try {
        const { title, description, category, price, deliveryTime } = req.body;
        const gig = await Gig.create({
            userId: req.user._id,
            title,
            description,
            category,
            price,
            deliveryTime
        });
        res.status(201).json(gig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a gig
// @route   PUT /api/skills/gigs/:id
const updateGig = async (req, res) => {
    try {
        const gig = await Gig.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!gig) return res.status(404).json({ message: 'Gig not found or unauthorized' });
        res.json(gig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a gig
// @route   DELETE /api/skills/gigs/:id
const deleteGig = async (req, res) => {
    try {
        const gig = await Gig.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!gig) return res.status(404).json({ message: 'Gig not found or unauthorized' });
        res.json({ message: 'Gig deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all gigs (marketplace)
// @route   GET /api/skills
const getSkillMarketplace = async (req, res) => {
    try {
        const gigs = await Gig.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'userId',
                    foreignField: 'targetId',
                    as: 'reviews'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    category: 1,
                    price: 1,
                    deliveryTime: 1,
                    userId: {
                        _id: '$user._id',
                        name: '$user.name',
                        role: '$user.role',
                        profilePicture: '$user.profilePicture'
                    },
                    reviewCount: { $size: '$reviews' },
                    avgRating: { $avg: '$reviews.rating' },
                    updatedAt: 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a review
const submitReview = async (req, res) => {
    try {
        const { targetId, rating, comment, context } = req.body;
        if (targetId === req.user._id.toString()) return res.status(400).json({ message: 'Self-review restricted' });
        const existing = await Review.findOne({ reviewerId: req.user._id, targetId });
        if (existing) return res.status(400).json({ message: 'Review already exists' });
        const review = await Review.create({ reviewerId: req.user._id, targetId, rating, comment, context });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new order or contact request
// @route   POST /api/skills/order
const createOrder = async (req, res) => {
    try {
        const { sellerId, gigId, type, message, price } = req.body;
        if (sellerId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot order your own service' });
        }
        const order = await SkillOrder.create({
            buyerId: req.user._id,
            sellerId,
            gigId,
            type,
            message,
            price
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's orders (bought and sold)
// @route   GET /api/skills/orders/me
const getMyOrders = async (req, res) => {
    try {
        const orders = await SkillOrder.find({
            $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
        })
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('gigId', 'title category')
        .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (Accept/Cancel/Deliver/Complete)
// @route   PATCH /api/skills/order/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status, deliveredWork } = req.body;
        const order = await SkillOrder.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const isBuyer = order.buyerId.toString() === req.user._id.toString();
        const isSeller = order.sellerId.toString() === req.user._id.toString();

        if (!isBuyer && !isSeller) return res.status(401).json({ message: 'Unauthorized' });

        // Logic for transitions
        if (status === 'accepted' && !isSeller) return res.status(400).json({ message: 'Only seller can accept' });
        if (status === 'delivered' && !isSeller) return res.status(400).json({ message: 'Only seller can deliver' });
        if (status === 'completed' && !isBuyer) return res.status(400).json({ message: 'Only buyer can complete' });

        if (status === 'delivered' && !deliveredWork) {
            return res.status(400).json({ message: 'Delivery requires work content' });
        }

        order.status = status;
        if (deliveredWork) order.deliveredWork = deliveredWork;
        
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
