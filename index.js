var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var simpleChain = require('./simpleChain.js')

app.use(bodyParser.json()); 

app.get("/block/:block", function(req, res){

    var blockHeight = req.params.block;
    var blockchain = new simpleChain.Blockchain(function(error, initData){
        if(error){
            res.json(400,{"error": "Generic error"});
        }else{
            blockchain.getBlock(blockHeight, function(err, result){ 
                if(err){
                    res.json(400,{"error": err});
                }else{

                    if(!result.body){
                        result.body = null;
                    }
                    res.json(200,result);
                }
            
            });
        }
    });
    
    
});

app.post("/block", function(req, res){

    var body = req.body.body;
    var block = new simpleChain.Block(body);
    var blockchain = new simpleChain.Blockchain(function(error, initData){
        if(error){
            res.json(400,{"error": "Generic error"});
        }else{
        blockchain.addBlock(block, function(err, newBlock){
            if(err){
                res.err(400,err);
            }else{
                if(!newBlock.body){
                        newBlock.body = null;
                    }
                res.json(200,newBlock);
            }
            
        });
        }
    });
    
});

app.listen(8000);
console.log("Server listening on localhost:8000");