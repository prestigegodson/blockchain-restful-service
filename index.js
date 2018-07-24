var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var simpleChain = require('./simpleChain.js')

app.use(bodyParser.json()); 

app.get("/block/:block", function(req, res){

    var blockHeight = req.params.block;
    var blockchain = new simpleChain.Blockchain();
    blockchain.getBlock(blockHeight, function(err, result){
        if(err){
            res.json(400,{"error": err});
        }else{
            res.json(200,result);
        }
        
    });
    
});

app.post("/block", function(req, res){

    var body = req.body.body;
    var block = new simpleChain.Block(body);
    var blockchain = new simpleChain.Blockchain();
    blockchain.addBlock(block, function(err, newBlock){
        if(err){
            res.err(400,err);
        }else{
            res.json(200,newBlock);
        }
        
    });
    
});

app.listen(3000);
console.log("Server listening on localhost:3000");