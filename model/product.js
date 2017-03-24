var mongodb = require('./connect');

var Schema = mongodb.mongoose.Schema;

var ProductSchema = new Schema({
  title: String,
  price: String,
  productId: String,
  productUrl: String,

  imgs: [String],
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

var ProductDAO = function(){};
var Product = mongodb.mongoose.model('Product', ProductSchema);

ProductDAO.prototype =  {
  constructor: ProductDAO,

  save: function(obj){
    return new Promise((resolve, reject) => {
      var instance = new Product(obj);
        instance.save((err) => {
          if(err) return reject(err);
          resolve();
        });
      });
    },

    delete: function(query) {
      return new Promise((resolve, reject) => {
        Product.remove(query, (err, data) => {
          if(err) return reject(err);
          resolve(data);
        });
      });
    }

    /*
    search: function(query){
      return new Promise((resolve, reject) => {
        Product.find(query, (err, data) => {
          if(err) return reject(err);
          var result = [];
          if(data) {
            for(var i=0,len=data.length;i<len;i++){
              d = {
                _id: data[i]._id,
                title: data[i].title,
                url: data[i].url,
                category: data[i].category,
                advertiser: data[i].advertiser,
                content: data[i].content
              }
              result.push(d)
            }
          }
          resolve(result);
        });
      });
    }
    */
}

module.exports = ProductDAO;
