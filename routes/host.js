const express = require('express');
const router = express.Router();
const { Caravan, Booking, User } = require('../models');

// Middleware to check if user is a host
const isHost = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'HOST') {
        return next();
    }
    res.status(403).send('Access Denied: You are not a host.');
};

// GET /host/create - Renders the form to create a caravan
router.get('/create', isHost, (req, res) => {
    res.render('host/create-caravan', { title: 'Create Caravan' });
});

// POST /host/create - Handles caravan creation
router.post('/create', isHost, async (req, res) => {
    try {
        const { name, description, capacity, price_per_day, location, amenities, photos } = req.body;
        
        await Caravan.create({
            name,
            description,
            capacity: parseInt(capacity, 10),
            price_per_day,
            location,
            amenities: amenities ? amenities.split(',').map(s => s.trim()) : [],
            photos: photos ? photos.split(',').map(s => s.trim()) : [],
            userId: req.session.user.id,
            status: 'AVAILABLE'
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).render('host/create-caravan', {
            title: 'Create Caravan',
            error: 'Something went wrong while creating the caravan.'
        });
    }
});

// POST /host/booking/:id/confirm - Confirm a booking
router.post('/booking/:id/confirm', isHost, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, { include: 'caravan' });
        // Security check: ensure the booking belongs to a caravan owned by the current host
        if (booking && booking.caravan.userId === req.session.user.id) {
            booking.status = 'CONFIRMED';
            await booking.save();
        } else {
            return res.status(404).send('Booking not found or not authorized.');
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
});

// POST /host/booking/:id/reject - Reject a booking
router.post('/booking/:id/reject', isHost, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, { include: 'caravan' });
        // Security check
        if (booking && booking.caravan.userId === req.session.user.id) {
            booking.status = 'CANCELLED';
            await booking.save();
        } else {
            return res.status(404).send('Booking not found or not authorized.');
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
});

module.exports = router;