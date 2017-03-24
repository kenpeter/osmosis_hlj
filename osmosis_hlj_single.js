var osmosis = require('osmosis');
var Promise = require('bluebird');
var CronJob = require('cron').CronJob;

var singlePage = 'http://hlj.com/search/go?p=R&srid=S1-1DFWP&lbc=hobbylink&w=*&url=%2f%2fhlj.com%2fproduct%2fBANN17166&rk=1&uid=82860342&sid=2&ts=custom&SLIPid=1490308286962&lgkey=http%3a%2f%2fhlj.com%2fproduct%2fBANN17166&rsc=ouckeOOyzMF3RjpL&method=and&isort=globalpop&view=grid';

osmosis
  .get(singlePage)
  .set({
    'title': 'h1.product-title',
    'imgs': ['img@src']
  })
  .data((mydata) => {
    //console.log('--- single page --')
    //console.log(JSON.stringify(data, null, 3));

    mydata.imgs.map((img, index) => {
      //console.log(img);
      // https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript
      // e.g. //d3toummn8j74h.cloudfront.net/ban/thumb_bann17166_0_1487663097.jpg?v=1487663097
      if(img.includes('cloudfront')) {
        if(img.includes('thumb_')) {
          let tmpImg = img.replace('thumb_', '');
          tmpImg = tmpImg.replace(/\/\//, '');
          //console.log(tmpImg);
        }
      }
    });
  });
