var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: {type: Number, get: getPrice, set: setPrice}

}, { timestamps: true });

function getPrice(num){
    return (num/100).toFixed(2);
}

function setPrice(num){
    return num*100;
}

var Item = mongoose.model('Item', itemSchema);
module.exports = Item;
