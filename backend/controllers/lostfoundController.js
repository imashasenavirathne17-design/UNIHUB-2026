const LostFoundItem = require('../models/lostfoundItem');
const Conversation = require('../models/lostfoundConversation');
const Message = require('../models/lostfoundMessage');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

// Helper function to resolve item and clean up associated noise data (kept for stats)
const resolveItemData = async (item) => {
    try {
        if (item.image) {
            const imagePath = path.join(__dirname, '..', item.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            item.image = null; 
        }
        const conversations = await Conversation.find({ itemId: item._id });
        const convIds = conversations.map(c => c._id);
        await Message.deleteMany({ conversationId: { $in: convIds } });
        await Conversation.deleteMany({ itemId: item._id });

        item.status = 'resolved';
        await item.save();
    } catch (err) {
        console.error("Error during item resolution:", err);
        throw err;
    }
};

// Helper function for true permanent deletion from database
const hardDeleteItemData = async (item) => {
    try {
        if (item.image) {
            const imagePath = path.join(__dirname, '..', item.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        const conversations = await Conversation.find({ itemId: item._id });
        const convIds = conversations.map(c => c._id);
        await Message.deleteMany({ conversationId: { $in: convIds } });
        await Conversation.deleteMany({ itemId: item._id });

        await item.deleteOne();
    } catch (err) {
        console.error("Error during hard deletion:", err);
        throw err;
    }
};

exports.createItem = async (req, res) => {
    try {
        const itemData = { ...req.body };
        if (req.file) {
            itemData.image = `uploads/lostfound/${req.file.filename}`;
        }
        
        const newItem = new LostFoundItem({
            ...itemData,
            postedBy: req.user.id
        });
        const savedItem = await newItem.save();

        // Send Confirmation Email to the user who posted
        const poster = await User.findById(req.user.id);
        if (poster) {
            await sendEmail({
                email: poster.email,
                subject: `UniHub Nexus: ${savedItem.type.toUpperCase()} Item Registered`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #14B8A6; padding: 20px; text-align: center; color: white;">
                            <h2 style="margin: 0;">UniHub Lost & Found</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p>Hi ${poster.name},</p>
                            <p>Your <b>${savedItem.type}</b> item report for <b>"${savedItem.title}"</b> has been successfully registered on the campus network.</p>
                            <p><b>Handover PIN:</b> <span style="font-size: 20px; font-weight: bold; color: #14B8A6;">${savedItem.handoverPin}</span></p>
                            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Keep this PIN secure. You will need it to verify the return and resolve the case.</p>
                        </div>
                    </div>
                `
            });
        }

        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const { type, category, status } = req.query;
        let query = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;

        const items = await LostFoundItem.find(query)
            .populate('postedBy', 'name email role')
            .sort({ createdAt: -1 })
            .lean();

        if (req.user) {
            const convs = await Conversation.find({ members: req.user._id }).lean();
            const convIds = convs.map(c => c._id);
            const unreadMessages = await Message.aggregate([
                { $match: { conversationId: { $in: convIds }, receiverId: req.user._id, isRead: false } },
                { $group: { _id: "$conversationId", count: { $sum: 1 } } }
            ]);
            
            const unreadMap = {};
            unreadMessages.forEach(u => unreadMap[u._id.toString()] = u.count);

            for (let item of items) {
                const itemConversations = convs.filter(c => c.itemId.toString() === item._id.toString());
                item.unreadCount = itemConversations.reduce((sum, c) => sum + (unreadMap[c._id.toString()] || 0), 0);
            }
        }

        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await LostFoundItem.findById(req.params.id)
            .populate('postedBy', 'name email role');
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateItemStatus = async (req, res) => {
    try {
        const item = await LostFoundItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        
        // Only poster or admin can update status
        if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (req.body.status === 'resolved') {
            await resolveItemData(item);
            return res.status(200).json({ message: "Item marked as resolved and data cleaned (kept for stats)" });
        }

        item.status = req.body.status;
        const updatedItem = await item.save();
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Messaging Controllers
exports.createConversation = async (req, res) => {
    try {
        const { receiverId, itemId } = req.body;
        
        // Avoid self-messaging
        if (receiverId === req.user.id) {
            return res.status(400).json({ message: "Cannot message yourself" });
        }

        // Check if conversation already exists for this item between these users
        let conversation = await Conversation.findOne({
            members: { $all: [req.user.id, receiverId] },
            itemId
        }).populate('members', 'name role').populate('itemId', 'title type');

        if (!conversation) {
            conversation = new Conversation({
                members: [req.user.id, receiverId],
                itemId
            });
            await conversation.save();
            // Re-fetch with population
            conversation = await Conversation.findById(conversation._id)
                .populate('members', 'name role')
                .populate('itemId', 'title type');
        }

        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Security check: only members of the conversation can delete it
        if (!conversation.members.includes(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this conversation" });
        }

        // Delete the conversation document
        await conversation.deleteOne();
        
        // Delete all messages associated with this conversation
        await Message.deleteMany({ conversationId });

        res.status(200).json({ message: "Conversation and associated messages legally deleted." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user.id] }
        })
        .populate('members', 'name role')
        .populate('itemId', 'title type')
        .sort({ lastUpdateTime: -1 })
        .lean();

        for (let conv of conversations) {
            conv.unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                receiverId: req.user.id,
                isRead: false
            });
        }

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, receiverId, text } = req.body;
        const newMessage = new Message({
            conversationId,
            senderId: req.user.id,
            receiverId,
            text
        });

        const savedMessage = await newMessage.save();

        // Update conversation last activity
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            lastUpdateTime: Date.now()
        });

        // Notify receiver via Email
        const receiver = await User.findById(receiverId);
        const sender = await User.findById(req.user.id);
        const conversation = await Conversation.findById(conversationId).populate('itemId');
        
        if (receiver && sender) {
            await sendEmail({
                email: receiver.email,
                subject: `UniHub: New Message from ${sender.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #14B8A6; padding: 20px; text-align: center; color: white;">
                            <h2 style="margin: 0;">Nexus Communications</h2>
                        </div>
                        <div style="padding: 30px;">
                            <p><b>${sender.name}</b> sent you a new message regarding <b>"${conversation?.itemId?.title || 'an item'}"</b>:</p>
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic; margin: 20px 0;">
                                "${text}"
                            </div>
                            <p>Log in to UniHub to reply directly.</p>
                        </div>
                    </div>
                `
            });
        }

        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markMessagesRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Message.updateMany(
            { conversationId, receiverId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: "Messages marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUnreadMessageCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiverId: req.user.id,
            isRead: false
        });
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await LostFoundItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        
        if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this item." });
        }

        await hardDeleteItemData(item);
        res.status(200).json({ message: "Item and associated data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyHandover = async (req, res) => {
    try {
        const item = await LostFoundItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (item.handoverPin !== req.body.pin && req.user.role !== 'admin') {
            return res.status(400).json({ message: "Invalid Handover PIN" });
        }

        await resolveItemData(item);
        res.status(200).json({ message: "Handover securely verified and item marked as resolved (cleaned for stats)" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
