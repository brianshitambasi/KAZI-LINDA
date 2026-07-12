const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send a message with notification
const sendMessage = async (req, res) => {
  try {
    const { receiverId, jobId, subject, message, attachments } = req.body;
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Create the message
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
    
    // Update or create conversation
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
    
    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      type: 'message',
      title: `New message from ${req.user.name}`,
      message: message.substring(0, 100),
      data: {
        senderId: req.user.id,
        senderName: req.user.name,
        conversationId: conversation._id,
        messageId: newMessage._id
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: newMessage, 
      conversation 
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get conversations for a user
const getConversations = async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user.id);
    
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email profilePicture role currentStatus isOnline')
    .populate('jobId', 'title')
    .sort({ updatedAt: -1 });
    
    console.log('Found conversations:', conversations.length);
    
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants ? conv.participants.find(p => p && p._id && p._id.toString() !== req.user.id) : null;
      
      if (!otherParticipant) {
        console.log('No other participant found for conversation:', conv._id);
        return null;
      }
      
      return {
        _id: conv._id,
        otherUser: {
          _id: otherParticipant._id,
          name: otherParticipant.name || 'Unknown',
          email: otherParticipant.email,
          profilePicture: otherParticipant.profilePicture || '',
          role: otherParticipant.role || 'User',
          currentStatus: otherParticipant.currentStatus,
          isOnline: otherParticipant.isOnline || false
        },
        job: conv.jobId,
        lastMessage: conv.lastMessage || '',
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount?.get(req.user.id) || 0
      };
    }).filter(conv => conv !== null);
    
    res.json(formattedConversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages between two users
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
  markAsRead,
  deleteMessage,
  getUnreadCount
};
