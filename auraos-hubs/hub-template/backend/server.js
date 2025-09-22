const express = require('express');
const cors = require('cors');

// Import connectors
// const flightConnector = require('./connectors/flightConnector');
// const restaurantConnector = require('./connectors/restaurantConnector');
// const shopConnector = require('./connectors/shopConnector');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---

// A simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Example of how a connector route could be structured
// app.post('/api/travel/flights/search', async (req, res) => {
//   try {
//     const { origin, destination, date } = req.body;
//     const results = await flightConnector.searchFlights(origin, destination, date);
//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to search for flights.' });
//   }
// });


// Start the server
app.listen(PORT, () => {
  console.log(`Hub backend server listening on port ${PORT}`);
});
