require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('âœ… MongoDB connected'))
  .catch(err => console.error('âŒ MongoDB error:', err));

// Socket.io for real-time emergency alerts
io.on('connection', (socket) => {
  console.log('í´Œ New client connected:', socket.id);
  
  socket.on('emergency', (data) => {
    io.emit('emergency_alert', data);
  });
  
  socket.on('disconnect', () => {
    console.log('í´Œ Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/emergency', emergencyRoutes);

// Test route
app.get('/', (req, res) => res.send('KAZI LINDA API is running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`íº€ Server running on port ${PORT}`));

// Message routes
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Add after other route imports
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);
const socialRoutes = require('./routes/socialRoutes');
app.use('/api/social', socialRoutes);
const { trackOnlineStatus } = require('./middleware/onlineStatus');
app.use(trackOnlineStatus);
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
const storyRoutes = require('./routes/storyRoutes');
app.use('/api/stories', storyRoutes);
