/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox.js');
const chainKey = "chain";

/* ===== Block Class ==============================
|  Class with a constructor for block 			       |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{

  constructor(callback){

    const self = this;
    levelSandbox.getLevelDBData(0,function(err, value){
      if(err){
        if(err.notFound){
          console.log("No key found");
          self.addBlock(new Block("First block in the chain - Genesis block"), function(err, data){
            callback(null, data);
          });
        }else{
          console.log(err);
          callback(err);
        }
      }else{
        callback(err);
      }
    });
    
  }

  // Add new block
  addBlock(newBlock, callback){

    levelSandbox.getAllData(function(err, chain){

      // Block height
      newBlock.height = chain.length;
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      // previous block hash
      if(chain.length > 0){
        newBlock.previousBlockHash = chain[chain.length-1].hash;
      }
      // Block hash with SHA256 using newBlock and converting to a string
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      // Adding block object to chain
      levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock));

      callback(err, newBlock);
    })
    
  
  }

  // Get block height
    getBlockHeight(){

      levelSandbox.getAllData(function(err, chain){
        if(err){
          //console.log(err);
        }else{
          console.log("Block Height " + (JSON.parse(JSON.stringify(chain)).length - 1));
        }
      });
      
    }

    // get block
    getBlock(blockHeight, callback){
      // return object as a single string
      levelSandbox.getLevelDBData(blockHeight, function(err, value){
        if(err){
          if(err.notFound){
            callback("Block not found", null);
          }else{
            callback(err,null);
          }
        }
        else{
          console.log("#Block " + blockHeight + " : " + value)
          callback(err, JSON.parse(JSON.parse(JSON.stringify(value))));
        }
      })
    }

    // validate block
     async validateBlock(blockHeight){
      
      return await new Promise(resolve => this.getBlock(blockHeight, function(err, value){
        let block = value;
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
            console.log("Block is valid");
            resolve(true);
          } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            resolve(false);
          }
      })).catch(e => console.log(e) );
      
    }

   // Validate blockchain
    async validateChain(){
        let self = this;
        levelSandbox.getAllData( async function(err, chain){

          let errorLog = [];
          for (var i = 0; i < chain.length; i++) {
            // validate block
            let isBlockValid = await self.validateBlock(chain[i].height);
            if (!isBlockValid)errorLog.push(i);

            if(i == 0 ){
              continue;
            }

            // compare blocks hash link
            let blockHash = chain[i - 1].hash;
            let previousHash = chain[i].previousBlockHash;
            if (blockHash !== previousHash) {
              errorLog.push(i);
            }
          }

          if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+ errorLog);
          } else {
            console.log('No errors detected');
          }
      });
    }

}

module.exports = {
    Blockchain : Blockchain,
    Block : Block
}
