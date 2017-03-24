var osmosis = require('osmosis');
var Promise = require('bluebird');
var CronJob = require('cron').CronJob;
var JobDAO = require('./model/job');

const jobDAO = new JobDAO();

const theListArr = [
  {
    list: 'https://www.seek.com.au/nodejs-jobs/in-All-Melbourne-VIC?page=',
    num: 4,
    cat: 'nodejs_melbourne'
  },
  {
    list: 'https://www.seek.com.au/javascript-jobs/in-All-Melbourne-VIC?page=',
    num: 10,
    cat: 'javascript_melbourne'
  },
  {
    list: 'https://www.seek.com.au/php-jobs/in-All-Melbourne-VIC?page=',
    num: 10, // max 10
    cat: 'php_melbourne'
  },
  {
    list: 'https://www.seek.com.au/IT-jobs/in-All-Melbourne-VIC?page=',
    num: 10, // max 10
    cat: 'it_melbourne'
  }
];


function genEachPage(theList, theListLength) {
  const theReturn = [];
  // theList ==== https://www.seek.com.au/php-jobs/in-All-Melbourne-VIC?page=
  for(var i=1; i<=theListLength; i++) {
    let page = theList + i;
    theReturn.push(page);
  }

  return theReturn;
}

function cleanup() {
  return jobDAO.delete();
}

function run() {
  return Promise.each(theListArr, (listObj) => {
    return new Promise((resolve, reject) => {
      console.log('====' + listObj.list + '====');
      let jobArr = genEachPage(listObj.list, listObj.num);

      Promise.each(jobArr, (singlePage) => {
        return new Promise((resolve1, reject1) => {
          console.log();
          console.log('~~~~~~' + singlePage + '~~~~~~');

          osmosis
            .get(singlePage)
            .find('article')
            .set({
              'script': 'script'
            })
            .data((data) => {
              let script = data.script;
              script = JSON.parse(script);

              let jobIdTmpArr = script.url.split('/');
              let jobId = jobIdTmpArr[jobIdTmpArr.length-1];

              let title = script.title;
              let url = script.url;
              let category = listObj.cat;
              let advertiser = script.hiringOrganization.name;

              let description = script.description;
              let content = ''; // assume body text from actual ad
              let employmentType = script.employmentType;
              let addressLocal = script.jobLocation.address.addressLocality;

              let addressRegion = script.jobLocation.address.addressRegion;
              let datePosted = Date(script.datePosted);

              console.log();
              console.log('--------' + title + ' -------');

              /*
              console.log(title);
              console.log(url);
              console.log(category);
              console.log(advertiser);

              console.log(description);
              console.log(content);
              console.log(employmentType);
              console.log(addressLocal);
              console.log(datePosted);
              */

              let obj = {
                jobId: jobId,
                title: title,
                url: url,
                category: category,
                advertiser: advertiser,

                description: description,
                content: content,
                employmentType: employmentType,
                addressLocal: addressLocal,

                addressRegion: addressRegion,
                datePosted: datePosted
              };

              jobDAO
                .save(obj)
                .then(() => {
                  resolve1();
                });

            })
            .error((err) => {
              console.log('--- single page error:' + singlePage);
              console.error(err);
              reject1();
            });

        }).delay(2000);
      })
      .then(() => {
        // ..............
        resolve();
      })
      .catch((err) => {
        console.log('--- page array error:' + theList);
        console.error(err);
        reject();
      });

    });

  });

}

var job = new CronJob('0 */45 * * * *', () => {
  cleanup()
  .then(() => {
    return run();
  })
  .then(() => {
    console.log('--- all done ---');
    process.exit(0);
  })
  .catch(err => {
    console.log('--- main error ---');
    console.error(err);
    process.exit(1);
  });
}, () => {
  console.log('--- cront done ---');
},
  true,
  'Etc/UTC'
);
