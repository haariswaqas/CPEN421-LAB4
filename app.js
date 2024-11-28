const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors package
const path = require('path'); // Import path for serving React files
const sequelize = require('./database');
const bookRoutes = require('./routes/bookRoutes');
const genreRoutes = require('./routes/genreRoutes'); // Import genreRoutes

dotenv.config();

const app = express();

// Enable CORS for requests from http://localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware
app.use(express.json());

// Serve React static files
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// API Routes
app.use('/api', bookRoutes);
app.use('/api', genreRoutes); // Add genre routes

// React fallback route (for SPA navigation)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Synchronize models with database schema
        await sequelize.sync({ alter: true }); // `alter: true` updates the schema without dropping data
        
        await sequelize.sync();
        console.log('Database models synchronized');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
