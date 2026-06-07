const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (like MongoDB link)
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow backend to understand JSON data

// Serve static files from the Frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB ✅'))
.catch(err => {
    console.error('Failed to connect to MongoDB ❌', err);
    console.error('Error details:', err.message);
    process.exit(1); // Stop server if DB fails
});

// Log connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

// Routes for Sign Up and Log In
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
