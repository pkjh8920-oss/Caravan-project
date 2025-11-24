const express = require('express');
const router = express.Router();
const { Caravan, User, Review } = require('../models');

// GET /caravans/:id - Caravan detail page
router.get('/:id', async (req, res) => {
    try {
        const caravan = await Caravan.findByPk(req.params.id, {
            include: [
                { model: User, as: 'host' },
                { 
                    model: Review, 
                    as: 'reviews',
                    include: [{ model: User, as: 'author' }]
                }
            ]
        });

        if (!caravan) {
            return res.status(404).send('Caravan not found');
        }
        
        // Calculate average rating
        const totalRating = caravan.reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = caravan.reviews.length > 0 ? (totalRating / caravan.reviews.length).toFixed(1) : 'No reviews yet';

        res.render('caravan-detail', { 
            title: caravan.name, 
            caravan,
            avgRating
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

module.exports = router;
