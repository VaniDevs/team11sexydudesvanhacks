var Item = require('../models/Item');

/**
 * GET /item
 * item page.
 */
exports.index = function(req, res) {
  res.render('item', {
    title: 'Create an item post'
  });
};

/**
* POST /item
* Making an item
*/
exports.postItem = function (req, res, next) {
  var item = new Item({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
  });

  console.log(req.body);

  item.save(function(err) {
    if (err) {
      return "Something went wrong";
    }
    res.status(204).end();
  });
}

/**
* Get /item/array
* Getting the list of items
*/
exports.getItemArray = function (req, res, next) {
  Item.find({}, function(err, itemArray) {
    if (err) {
      return next(err);
    }
    res.status(200).send(itemArray);
  });
}

/**
* Get /item/array
* Getting the list of items
*/
exports.deleteItem = function (req, res, next) {
  console.log(req.params.itemId);

  Item.remove({_id:req.params.itemId}, function(err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
}
