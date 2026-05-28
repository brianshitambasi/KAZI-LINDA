require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const profileRoutes = require('./routes/profileRoutes');
const socialRoutes = require('./routes/socialRoutes');
const messageRoutes = require('./routes/messageRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] } });

app.set('io', io);

app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], imgSrc: ["'self'", "data:", "https://res.cloudinary.com"] } }, hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } }));

const allowedOrigins = ['https://kazi-linda-app.vercel.app', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { message: 'Too many login/register attempts. Try again in 15 minutes.' }, skipSuccessfulRequests: true });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(mongoSanitize());
app.use(xss());
app.use(compression());

if (process.env.NODE_ENV === 'development') { app.use(morgan('dev')); }

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => { if (req.query && Object.keys(req.query).length > 20) { return res.status(400).json({ message: 'Too many query parameters' }); } next(); });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 }).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err));

io.on('connection', (socket) => { console.log('New client connected:', socket.id); socket.on('emergency', (data) => { io.emit('emergency_alert', data); }); socket.on('disconnect', () => { console.log('Client disconnected:', socket.id); }); });

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('KAZI LINDA API is running'));
app.get('/health', (req, res) => { res.status(200).json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() }); });

const { trackOnlineStatus } = require('./middleware/onlineStatus');
app.use(trackOnlineStatus);

app.use('*', (req, res) => { res.status(404).json({ message: 'Cannot ' + req.method + ' ' + req.originalUrl }); });

app.use((err, req, res, next) => { console.error('Error:', err.stack); if (err.name === 'ValidationError') { return res.status(400).json({ message: err.message }); } if (err.name === 'JsonWebTokenError') { return res.status(401).json({ message: 'Invalid token' }); } if (err.statusCode === 429) { return res.status(429).json({ message: 'Too many requests' }); } res.status(err.statusCode || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message }); });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
