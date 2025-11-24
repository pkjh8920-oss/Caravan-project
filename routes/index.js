const express = require('express');
const router = express.Router();
const { Caravan, Booking, User, Review } = require('../models');
const { Op } = require('sequelize');

// GET / - Home page with caravan search
router.get('/', async (req, res) => {
    try {
        const { location, capacity } = req.query;
        const whereClause = { status: 'AVAILABLE' };

        if (location) {
            whereClause.location = { [Op.like]: `%${location}%` };
        }
        if (capacity) {
            whereClause.capacity = { [Op.gte]: parseInt(capacity, 10) };
        }

        const caravans = await Caravan.findAll({ where: whereClause });
        res.render('index', { title: 'Home', caravans });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

// GET /dashboard - Display user-specific dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findByPk(req.session.user.id);
        if (!user) {
            return res.redirect('/login');
        }

        let data = {};
        if (user.role === 'HOST') {
            // Host: Get their caravans and incoming booking requests
            const myCaravans = await Caravan.findAll({ where: { userId: user.id }});
            const caravanIds = myCaravans.map(c => c.id);
            
            const incomingBookings = await Booking.findAll({
                where: { caravanId: { [Op.in]: caravanIds } },
                include: [{ model: Caravan, as: 'caravan' }, { model: User, as: 'guest' }],
                order: [['createdAt', 'DESC']]
            });
            data = { myCaravans, incomingBookings };

        } else {
            // Guest: Get their bookings
            const myBookings = await Booking.findAll({
                where: { userId: user.id },
                include: { model: Caravan, as: 'caravan' },
                order: [['createdAt', 'DESC']]
            });
             const reviews = await Review.findAll({ where: { userId: user.id } });
            data = { myBookings, reviews };
        }

        res.render('dashboard', {
            title: 'Dashboard',
            user,
            data
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).send('Something went wrong');
    }
});


module.exports = router;