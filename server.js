// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors

// Initialize app and middleware
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactionsDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define schema and model
const transactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    sold: Boolean,
    category: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// API to initialize the database
app.get('/api/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        // Seed data into MongoDB
        await Transaction.deleteMany();
        await Transaction.insertMany(data);

        res.status(200).send({ message: 'Database initialized with seed data' });
    } catch (error) {
        res.status(500).send({ message: 'Error initializing database', error });
    }
});

// API to list all transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;

    try {
        const query = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: 'i' } },
                      { description: { $regex: search, $options: 'i' } },
                      { price: parseFloat(search) || 0 },
                  ],
              }
            : {};

        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching transactions', error });
    }
});

// API for statistics
app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;

    if (!month) return res.status(400).send({ message: 'Month is required' });

    try {
        const startDate = new Date(`2021-${month.padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transaction.find({
            dateOfSale: { $gte: startDate, $lt: endDate },
        });

        const totalSaleAmount = transactions.reduce((sum, t) => sum + t.price, 0);
        const totalSoldItems = transactions.filter((t) => t.sold).length;
        const totalNotSoldItems = transactions.filter((t) => !t.sold).length;

        res.status(200).send({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching statistics', error });
    }
});

// API for bar chart
app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).send({ message: 'Month is required' });

    try {
        const startDate = new Date(`2021-${month.padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transaction.find({
            dateOfSale: { $gte: startDate, $lt: endDate },
        });

        const ranges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901+': 0,
        };

        transactions.forEach((t) => {
            if (t.price <= 100) ranges['0-100']++;
            else if (t.price <= 200) ranges['101-200']++;
            else if (t.price <= 300) ranges['201-300']++;
            else if (t.price <= 400) ranges['301-400']++;
            else if (t.price <= 500) ranges['401-500']++;
            else if (t.price <= 600) ranges['501-600']++;
            else if (t.price <= 700) ranges['601-700']++;
            else if (t.price <= 800) ranges['701-800']++;
            else if (t.price <= 900) ranges['801-900']++;
            else ranges['901+']++;
        });

        res.status(200).send(ranges);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching bar chart data', error });
    }
});

// API for pie chart
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).send({ message: 'Month is required' });

    try {
        const startDate = new Date(`2021-${month.padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transaction.find({
            dateOfSale: { $gte: startDate, $lt: endDate },
        });

        const categoryCounts = {};

        transactions.forEach((t) => {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        });

        res.status(200).send(categoryCounts);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching pie chart data', error });
    }
});

// API to fetch combined data
app.get('/api/combined', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).send({ message: 'Month is required' });

    try {
        const [statistics, barChart, pieChart] = await Promise.all([
            axios.get(`http://localhost:3000/api/statistics?month=${month}`),
            axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
            axios.get(`http://localhost:3000/api/pie-chart?month=${month}`),
        ]);

        res.status(200).send({
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data,
        });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching combined data', error });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
