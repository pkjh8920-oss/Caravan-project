const express = require('express');
const router = express.Router();
const { Booking, Caravan, Review, User } = require('../models');
const { Op } = require('sequelize');

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// POST /booking - Create a new booking request
router.post('/booking', isLoggedIn, async (req, res) => {
    try {
        const { caravanId, startDate, endDate } = req.body;
        const userId = req.session.user.id;
        const caravan = await Caravan.findByPk(caravanId);
        if (!caravan) return res.status(404).send('Caravan not found');

        const conflictingBooking = await Booking.findOne({ where: { caravanId, status: { [Op.ne]: 'CANCELLED' }, [Op.or]: [ { startDate: { [Op.between]: [startDate, endDate] } }, { endDate: { [Op.between]: [startDate, endDate] } }, { [Op.and]: [ { startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } } ] } ] } });
        if (conflictingBooking) {
            return res.status(409).send('Booking dates conflict with an existing booking.');
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = days * parseFloat(caravan.price_per_day);
        
        await Booking.create({ caravanId, userId, startDate, endDate, totalPrice, status: 'PENDING' });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Booking creation failed:', error);
        res.status(500).send('Something went wrong.');
    }
});

// POST /booking/:id/pay - Mock payment for a booking
router.post('/booking/:id/pay', isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        // Security Check: ensure the booking belongs to the logged-in user and is confirmed
        if (booking && booking.userId === req.session.user.id && booking.status === 'CONFIRMED') {
            booking.status = 'COMPLETED'; // Mark as completed instead of a separate 'PAID' status
            await booking.save();
            // In a real app, you might set a flash message for 'Payment successful!'
        } else {
            return res.status(404).send('Booking not found or not ready for payment.');
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
});

// POST /booking/:id/review - Create a review for a completed booking
router.post('/booking/:id/review', isLoggedIn, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const bookingId = req.params.id;
        const userId = req.session.user.id;

        const booking = await Booking.findByPk(bookingId);
        
        // Security Check: user can only review their own, completed bookings
        if (!booking || booking.userId !== userId || booking.status !== 'COMPLETED') {
            return res.status(403).send('This booking cannot be reviewed.');
        }
        
        // Prevent double reviews
        const existingReview = await Review.findOne({ where: { bookingId, userId }});
        if(existingReview) {
            return res.status(409).send('You have already reviewed this booking.');
        }

        await Review.create({
            rating: parseInt(rating, 10),
            comment,
            userId,
            caravanId: booking.caravanId,
            bookingId
        });
        
        // Optional: Update host reliability
        const host = await User.findByPk(booking.caravan.hostId);
        // Implement a more robust reliability calculation later
        // For now, just a simple average update
        const allReviewsForHostCaravans = await Review.findAll({
            include: { model: Caravan, where: { userId: host.id }}
        });
        const totalRating = allReviewsForHostCaravans.reduce((sum, r) => sum + r.rating, 0);
        host.reliability = totalRating / allReviewsForHostCaravans.length;
        await host.save();


        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong.');
    }
});


module.exports = router;