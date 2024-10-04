//Project: Stock Trading App -Akshit Pathania

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected ");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

app.set('view engine', 'ejs');
app.use(express.static('public'));

//trading controller
const tradingController = require('./Controllers/tradingController');

// route to monitor stock nd dashboard
app.get('/', tradingController.monitorStock);

//stock price monitoring(5sec)
tradingController.startMonitoring();


app.listen
