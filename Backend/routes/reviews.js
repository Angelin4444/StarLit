const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 }); // Newest first
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new review
router.post('/', async (req, res) => {
    try {
        const { name, text } = req.body;
        const newReview = new Review({ name, text });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
