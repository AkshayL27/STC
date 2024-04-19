require('dotenv').config(); // This will load the environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'chrome-extension://dhafaeabeddmhjcnggmbdjgkoemmmaib',  // Replace [EXTENSION_ID] with your extension's actual ID
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(helmet()); // Adds security HTTP headers
app.use(compression()); // Compresses server responses
app.use(morgan('combined')); // Enables request logging

const uri = 'mongodb+srv://Develper:AIXsZe815TEfIeVW@browserextension.95rndmy.mongodb.net/?retryWrites=true&w=majority';
// <<<<<<< newtest
// mongoose.connect(uri, { dbName: "Test", useNewUrlParser: true, useUnifiedTopology: true });
// =======
mongoose.connect(uri, { dbName: 'BrowserExtension', useNewUrlParser: true, useUnifiedTopology: true });
// >>>>>>> main

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true},
    password: String,
    websites: [
        {
            name: { type: String, unique: true},
            url: { type: String, unique: true},
            password: String,
            type: String,
            key: String
        },
    ],
});

const User = mongoose.model('User', userSchema);

// Signup
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    try {
        await user.save();
        console.log("signup successful");
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error signing up' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
});

app.post('/refresh-token', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
    return res.status(400).json({ message: 'Invalid refresh token' });
    }
    
    try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    } catch (err) {
    return res.status(500).json({ message: 'Error refreshing token' });
    }
});

// Protected route with JWT
app.get('/weburls', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Extract website URLs from the user object
        const websiteURLs = user.websites.map(website => website.url);

        res.json({
            message: `Welcome, ${user.username}!`,
            websites: websiteURLs, // Send only website URLs
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error finding user' });
    }
});


// Add website data
app.post('/website', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { websiteDataArray } = req.body;

    if (!Array.isArray(websiteDataArray) || websiteDataArray.length === 0) {
        //console.log('Not an array');
        return res.status(400).json({ message: 'Invalid website data array' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        for (const websiteData of websiteDataArray) {
            // Check for duplicates
            const isDuplicate = user.websites.some((existingWebsite) => {
                return existingWebsite.url === websiteData.url;
            });

            if (isDuplicate) {
                return res.status(400).json({ message: 'Website is a duplicate' });
            }

            user.websites.push(websiteData);
        }

        await user.save();
        res.status(201).json({ message: 'Websites added successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error adding website' });
    }
});



app.put('/website', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { oldWebsiteData, newWebsiteData } = req.body;

    if (!oldWebsiteData || !newWebsiteData) {
        return res.status(400).json({ message: 'Both old and new website data are required' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find the index of the website to be updated based on the old website data.
        const websiteIndexToUpdate = user.websites.findIndex((website) => {
            return (
                website.name === oldWebsiteData.name &&
                website.url === oldWebsiteData.url &&
                website.password === oldWebsiteData.password
            );
        });

        if (websiteIndexToUpdate === -1) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Update the website data at the specified index with the new data.
        user.websites[websiteIndexToUpdate] = newWebsiteData;

        await user.save();
        res.status(200).json({ message: 'Website updated successfully' });

    } catch (err) {
        return res.status(500).json({ message: 'Error updating website' });
    }
});

app.get('/website', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const allWebsites = user.websites;

        res.status(200).json(allWebsites);
    } catch (err) {
        res.status(500).json({ message: 'Error finding websites' });
    }
});

app.delete('/website', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Remove all websites from the user's websites array.
        user.websites = [];

        await user.save();
        res.status(204).json({ message: 'All websites deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting websites' });
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});