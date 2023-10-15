const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
const uri = 'mongodb+srv://Develper:AIXsZe815TEfIeVW@browserextension.95rndmy.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri);

// User userschema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    websites: [
        {
            name: String,
            url: String,
            password: String,
        },
    ],
});


// User
const User = mongoose.model('User', userSchema);


// Express Session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// CSRF Protection Middleware
//app.use(csrfProtection);

// Signup
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    user.save(err => {
        if (err) {
            return res.status(500).json({ message: 'Error signing up' });
        }
        return res.status(201).json({ message: 'User registered successfully' });
    });
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1d' });
    res.json({ token });
});

// Protected route with JWT
app.get('/profile', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify and decode the JWT token
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Use decoded.userId to fetch user data and respond accordingly
        User.findById(decoded.userId, (err, user) => {
            if (err || !user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            res.json({
                message: `Welcome, ${user.username}!`,
                websites: user.websites, // Include the websites data here
            });
        });
    });
});


// Add website data
app.post('/add-website', async (req, res) => {
    const { userId, websiteData } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.websites.push(websiteData);
        await user.save();

        res.status(201).json({ message: 'Website added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding website' });
    }
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
