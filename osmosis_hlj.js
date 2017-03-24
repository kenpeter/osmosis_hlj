const osmosis = require('osmosis');
const Promise = require('bluebird');
const CronJob = require('cron').CronJob;
const axios = require('axios');

const fs = require('fs');
const path = require('path');
var ProductDAO = require('./model/product');
const productDAO = new ProductDAO();

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
        .find('.title h2 a')
        .follow('@href')
        .set({
          'title': 'h1.product-title',
          'price': 'span.sale-price',
          'imgs': ['img@src']
        })
        .data((mydata) => {
          let productObj = {};

          let title = mydata.title;
          let price = mydata.price;
          let imgs = mydata.imgs;
          let ProductId = null;

          productObj = {
            title: title,
            price: price,
            productId: null,
            productUrl: null,
            imgs: []
          };

          // each image
          let isAssignProductId = true;
          Promise.each(imgs, (img, index) => {
            return new Promise((resolve1, reject1) => {
              if(img.includes('cloudfront')) {
                if(img.includes('thumb_')) {
                  let tmpImg = img.replace('thumb_', '');
                  tmpImg = tmpImg.replace(/\/\//, '');
                  let fileName = getImageFilename(tmpImg);

                  // Hak
                  let singImgUrl = 'http://d3toummn8j74h.cloudfront.net/ban/' + fileName;
                  productObj.imgs.push(singImgUrl);
                  if(isAssignProductId) {
                    let tmpProdId = getProductIdByPath(tmpImg);
                    productObj.productId = tmpProdId;
                    productObj.productUrl = 'http://hlj.com/product/' + tmpProdId;
                    isAssignProductId = false;
                  }


                }
                else {

                }
              }
              else {

              }

              resolve1();

            });
          })
          .then(() => {
            // Save to db
            productDAO
              .save(productObj)
              .then(() => {
                console.log('---------- single page ----------');
                //console.log(productObj);
                console.log('productObj is saved@');

                resolve()
              });

          });
        })
        .error((err) => {
          console.error(err);
          reject();
        }); // end data
      }); // end promise

    }); // end promise each
}


function getImageFilename(path) {
  //e.g. d3toummn8j74h.cloudfront.net/ban/bann12185_0_1482294330.jpg?v=1482294330
  let arr = path.split('/');
  let lastElement = arr[arr.length-1];
  let fileName = lastElement.split('?')[0];
  return fileName;
}

function getProductIdByPath(path) {
  //e.g. d3toummn8j74h.cloudfront.net/ban/bann12185_0_1482294330.jpg?v=1482294330
  let arr = path.split('/');
  let lastElement = arr[arr.length-1];
  let fileName = lastElement.split('?')[0];
  let productId = fileName.split('_')[0];
  return productId;
}

// run
productDAO
  .delete()
  .then(() => {
    return run();
  })
  .then(() => {
    console.log('-- all done');
    process.exit(0);
  });
