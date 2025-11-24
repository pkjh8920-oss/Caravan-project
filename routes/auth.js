const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /signup - Renders the signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

// POST /signup - Handles user registration
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).render('signup', { title: 'Sign Up', error: 'User already exists' });
        }
        await User.create({ name, email, password, role });
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).render('signup', { title: 'Sign Up', error: 'Something went wrong' });
    }
});

// GET /login - Renders the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// POST /login - Handles user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validPassword(password))) {
            return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });
        }
        req.session.user = { id: user.id, name: user.name, role: user.role, email: user.email };
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).render('login', { title: 'Login', error: 'Something went wrong' });
    }
});

// POST /logout - Handles user logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});


module.exports = router;
