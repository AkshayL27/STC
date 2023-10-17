const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
//const csrf = require('csurf');
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
    try {
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error signing up' });
    }    
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
app.get('/profile', async (req, res) => {
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

        res.json({
            message: `Welcome, ${user.username}!`,
            websites: user.websites,
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

    const { websiteData } = req.body;

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        user.websites.push(websiteData);
        await user.save();
        res.status(201).json({ message: 'Website added successfully' });

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

app.get('/website/:identifier', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { identifier } = req.params;

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Search for a website matching the identifier (name or URL)
        const matchedWebsite = user.websites.find((website) => {
            return website.name === identifier || website.url === identifier;
        });

        if (matchedWebsite) {
            res.status(200).json(matchedWebsite);
        } else {
            res.status(404).json({ message: 'Website not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error finding website' });
    }
});

app.delete('/website/:identifier', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { identifier } = req.params;

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find the index of the website to be deleted based on the identifier (name or URL).
        const websiteIndexToDelete = user.websites.findIndex((website) => {
            return website.name === identifier || website.url === identifier;
        });

        if (websiteIndexToDelete === -1) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Remove the website at the specified index from the user's websites array.
        user.websites.splice(websiteIndexToDelete, 1);

        await user.save();
        res.status(204).json({ message: 'Website deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting website' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
