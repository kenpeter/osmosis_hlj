var mongodb = require('./connect');

var Schema = mongodb.mongoose.Schema;

var JobSchema = new Schema({
  jobId: String,
  title:  String,
  url: String,
  category: String,
  advertiser: String,

  description: String,
  content: String,
  employmentType: String,
	addressLocal: String,

	addressRegion: String,
  datePosted: { type: Date, default: Date.now },
});

var JobDAO = function(){};
var Job = mongodb.mongoose.model('Job', JobSchema);

JobDAO.prototype =  {
  constructor: JobDAO,

  save: function(obj){
    return new Promise((resolve, reject) => {
      var instance = new Job(obj);
        instance.save((err) => {
          if(err) return reject(err);
          resolve();
        });
      });
    },

    delete: function(query) {
      return new Promise((resolve, reject) => {
        Job.remove(query, (err, data) => {
          if(err) return reject(err);
          resolve(data);
        });
      });
    },

    search: function(query){
      return new Promise((resolve, reject) => {
        Job.find(query, (err, data) => {
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
}

module.exports = JobDAO;
