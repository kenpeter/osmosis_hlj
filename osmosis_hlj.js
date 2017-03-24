var osmosis = require('osmosis');
var Promise = require('bluebird');
var CronJob = require('cron').CronJob;


const theBaseList = 'https://hlj.com/search/go?p=Q&srid=S1-2DFWP&lbc=hobbylink&ts=custom&w=*&uid=699945098&method=and&af=category%3agun&isort=globalpop&view=grid&srt=';
//const theListLength = 2496; // start index of last page, 24 items per page, 105 pages.
const theListLength = 48;
let listArr = [];

function genEachPage(theBaseList, theListLength) {
  const theReturn = [];
  // theList ==== https://www.seek.com.au/php-jobs/in-All-Melbourne-VIC?page=
  for(var i=0; i<=theListLength; i=i+24) {
    let page = theBaseList + i;
    theReturn.push(page);
  }

  return theReturn;
}


listArr = genEachPage(theBaseList, theListLength);
//console.log(JSON.stringify(listArr, null, 4));

function run() {
  return Promise.each(listArr, (list) => {
    return new Promise((resolve, reject) => {
      osmosis
        .get(list)
        .find('.item .box')
        .set({
          'title': '.title h2 a',
          'id_title': '.title h2 a@title',
          'price': '.ourbox .price',
        })
        .find('.title h2 a')
        .follow('@href')
        .set({
          'imgs': ['img@src'],
        })
        .data((mydata) => {
          let title = mydata.title;
          let price = mydata.price;
          let id_title = mydata.id_title;

          let tmpArr = id_title.split('/');
          let product_id = tmpArr[tmpArr.length-1];

          let imgs = mydata.imgs;

          console.log('---------- single page ----------');
          console.log(title);
          console.log(price);
          console.log(product_id);

          Promise.each(imgs, (img) => {
            return new Promise((resolve1, reject1) => {
              //console.log(img);
              if(img.includes('cloudfront')) {
                if(img.includes('thumb_')) {
                  let tmpImg = img.replace('thumb_', '');
                  tmpImg = tmpImg.replace(/\/\//, '');
                  console.log(tmpImg);
                }
                else {

                }
              }
              else {

              }
              // resolve no matter what
              resolve1();
            });
          })
          .then(() => {
            console.log('promise.each done');
            resolve();
          });
        });
    });
  });

}

run().then(() => {
  console.log('-- all done');
  process.exit(0);
});
