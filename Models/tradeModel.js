//Project: Stock Trading App -Akshit Pathania
const mongoose = require('mongoose');


const tradeSchema = new mongoose.Schema({
  action: String,  
  price: Number,   
  date: { type: Date, default: Date.now },  
});
const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;
