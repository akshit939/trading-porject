//Project: Stock Trading App -Akshit Pathania

const axios = require('axios');
const Trade = require('../Models/tradeModel');

// initial balance ,stocks owned etc
let balance = 10000; 
let stockQuantity = 0;  
let lastPrice = 100; 
let stockPrice = 100;  //curr stock pricw


async function getStockPrice() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;  // API in environment variables
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=${apiKey}`);
    const prices = response.data["Time Series (5min)"];
    if (prices) {
      const latestTimestamp = Object.keys(prices)[0];
      return parseFloat(prices[latestTimestamp]["4. close"]);
    }
    else {
      return stockPrice;  // Return the previous price if API fails
    }  
} catch (error) {
    console.error('Error fetching stock price:', error);
    return stockPrice;  
}
}

// Buy if price drops 2%, sell if price rises 3%
function tradeStock(currentPrice) {
  if (currentPrice < lastPrice * 0.98 && balance >= currentPrice) {

    // Buy 
    const quantityToBuy = Math.floor(balance / currentPrice);
    if (quantityToBuy > 0) {
      balance -= quantityToBuy * currentPrice;
      stockQuantity += quantityToBuy;
      lastPrice = currentPrice;
      const trade = new Trade({ action: 'buy', price: currentPrice });
      trade.save();  
      console.log(`Bought ${quantityToBuy} stocks at $${currentPrice}`);
    }
  } else if (currentPrice > lastPrice * 1.03 && stockQuantity > 0) {

    // Sell 
    balance += stockQuantity * currentPrice;
    stockQuantity = 0;
    lastPrice = currentPrice;
    const trade = new Trade({ action: 'sell', price: currentPrice });
    trade.save();  
    console.log(`Sold all stocks at $${currentPrice}`);
  }
}

//update dashboard
exports.monitorStock = async (req, res) => {

  stockPrice = await getStockPrice(); //current stock price


  tradeStock(stockPrice);

 // Calculate profit/loss
  const profitLoss = (stockQuantity * stockPrice) + balance - 10000;  //initial balance

  // history
  const trades = await Trade.find().sort({ date: -1 });

  // Render the dashboard
  res.render('index', {
    balance: balance,
    stockPrice: stockPrice,  
    stockQuantity: stockQuantity,
    trades: trades,
    profitLoss: profitLoss.toFixed(2),
  });
};

//stock price every 5 seconds
exports.startMonitoring = () => {
  setInterval(async () => {
    stockPrice = await getStockPrice();
    tradeStock(stockPrice);  
  }, 5000);  //stock price every 5 seconds
};
