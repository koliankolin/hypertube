const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
// connect db
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/films', require('./routes/api/films'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/parser', require('./routes/api/parser'));

const PORT = process.env.PORT || 5000;

app.get('/', (request, response) => response.send('API running'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));