const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"KAZI LINDA" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, jobId, subject, message, attachments } = req.body;
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      jobId,
      subject: subject || `Message from ${req.user.name}`,
      message,
      attachments: attachments || []
    });
    
    await newMessage.populate('senderId', 'name email profilePicture role currentStatus');
    await newMessage.populate('receiverId', 'name email profilePicture role');
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });
    
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastMessageAt = new Date();
      conversation.updatedAt = new Date();
      const currentUnread = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, currentUnread + 1);
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        jobId,
        lastMessage: message,
        lastMessageAt: new Date(),
        unreadCount: new Map([[receiverId, 1]])
      });
      await conversation.populate('participants', 'name email profilePicture role currentStatus');
    }
    
    if (receiver.emailNotifications !== false) {
      await sendEmailNotification(
        receiver.email,
        `New message from ${req.user.name} on KAZI LINDA`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #f39c12;">New Message from ${req.user.name}</h2>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>From:</strong> ${req.user.name} (${req.user.role})</p>
              <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages" style="background: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply</a>
            </div>
          </div>
        `
      );
    }
    
    res.status(201).json({ success: true, message: newMessage, conversation });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get conversations with full user details
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email profilePicture role currentStatus rating lastSeen countryOfOrigin currentCountry skills')
    .populate('jobId', 'title company country')
    .sort({ updatedAt: -1 });
    
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== req.user.id);
      return {
        _id: conv._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          profilePicture: otherUser.profilePicture,
          role: otherUser.role,
          currentStatus: otherUser.currentStatus,
          rating: otherUser.rating,
          lastSeen: otherUser.lastSeen,
          countryOfOrigin: otherUser.countryOfOrigin,
          currentCountry: otherUser.currentCountry,
          skills: otherUser.skills || []
        },
        job: conv.jobId,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount.get(req.user.id) || 0
      };
    });
    
    res.json(formattedConversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages between users
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId, isDeletedForSender: false },
        { senderId: userId, receiverId: req.user.id, isDeletedForReceiver: false }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('senderId', 'name email profilePicture role')
    .populate('receiverId', 'name email profilePicture role');
    
    await Message.updateMany(
      { senderId: userId, receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] }
    });
    if (conversation) {
      conversation.unreadCount.set(req.user.id, 0);
      await conversation.save();
    }
    
    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit),
      page: parseInt(page)
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user profile for messaging
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password')
      .populate('reviews.userId', 'name profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { isRead: true, readAt: new Date() });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.senderId.toString() === req.user.id) {
      message.isDeletedForSender = true;
    } else if (message.receiverId.toString() === req.user.id) {
      message.isDeletedForReceiver = true;
    }
    
    await message.save();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
      isDeletedForReceiver: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  getUserProfile,
  markAsRead,
  deleteMessage,
  getUnreadCount
};
