const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Job = require('../models/Job');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification
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
    
    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      jobId,
      subject,
      message,
      attachments
    });
    
    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });
    
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastMessageAt = new Date();
      conversation.updatedAt = new Date();
      // Increment unread count for receiver
      const currentUnread = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, currentUnread + 1);
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        jobId,
        lastMessage: message,
        unreadCount: new Map([[receiverId, 1]])
      });
    }
    
    // Get receiver details for email
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(req.user.id);
    
    // Send email notification
    await sendEmailNotification(
      receiver.email,
      `New message from ${sender.name} on KAZI LINDA`,
      `
        <h3>New Message from ${sender.name}</h3>
        <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br/>
        <p>Login to your KAZI LINDA account to reply.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages">View Message</a>
      `
    );
    
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get conversations for a user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email role')
    .populate('jobId', 'title')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name');
    
    // Mark messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    // Update conversation unread count
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] }
    });
    if (conversation) {
      conversation.unreadCount.set(req.user.id, 0);
      await conversation.save();
    }
    
    res.json(messages);
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

// Delete message (soft delete)
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
  markAsRead,
  deleteMessage,
  getUnreadCount
};
