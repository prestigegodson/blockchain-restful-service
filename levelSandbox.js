/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

// Get data from levelDB with key
function getLevelDBData(key,callback){
  db.get(key, function(err, value) {
    callback(err, value);
  })
}


function getAllData(callback){
  let chain = [];
  db.createReadStream().on('data', function(data) {
    chain.push(JSON.parse(data.value));
    //console.log("# " + data.key + " : " + data.value);
    }).on('error', function(err) {
        callback(err, null);
    }).on('close', function() {
      console.log('Closed');
      callback(null, chain);
    });
}


exports.addLevelDBData = addLevelDBData;
exports.getLevelDBData = getLevelDBData;
exports.getAllData = getAllData;

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
