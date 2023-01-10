const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();
const { v4: uuid } = require("uuid");
const port = process.argv[2];
const rp = require("request-promise");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const nodeAddress = uuid().split("-").join("");

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.get('/consensus',(req,res)=>{
    const reqPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/blockchain',
            method:'GET',
            json:true
        }
        reqPromises.push(requestOptions);
    });
    Promise.all(reqPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
        });

        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
            res.json({
                note:'Current chain has not been replaced',
                chain: bitcoin.chain
            })
        }
        else{
            bitcoin.chain=newLongestChain;
            bitcoin.pendingTransactions=newPendingTransactions;
            res.json({
                note:'This chain has been replaced',
                chain:bitcoin.chain
            });
        }
    })
});

app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const prevBlockHash = lastBlock["hash"];
  const currBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = bitcoin.proofofWork(prevBlockHash, currBlockData);
  const hash = bitcoin.hashBlock(prevBlockHash, currBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash, hash);

  const reqPromises=[];
  bitcoin.networkNodes.forEach(networkNodeUrl=>{
      const requestOptions={
          uri:networkNodeUrl+'/recieve-new-block',
          method:"POST",
          body:{newBlock:newBlock},
          json:true
      }
      reqPromises.push(rp(requestOptions));
  });
      Promise.all(reqPromises).then(data=>{
          const requestOptions={
              uri:bitcoin.currentNodeUrl+'/transaction/broadcast',
              method:"POST",
              body:{
                  amount:0.25,
                  sender:"00",
                  recipient:nodeAddress
              },
              json:true
          };
          return rp(requestOptions);
      }).then(data=>{
          res.json({ note: "New Block mined successfully", block: newBlock });
      });
  });

app.post("/transaction", (req, res) => {
  const newTransaction=req.body;
  const blockIndex=bitcoin.addTransactiontoPendingTransactions(newTransaction);
  res.json({note:`Transaction will be added to the block ${blockIndex}`});
});

app.post('/recieve-new-block',(req,res)=>{
    const newBlock=req.body.newBlock;
    const lastBlock=bitcoin.getLastBlock();
    const correctHash=lastBlock.hash===newBlock.previousBlockHash;

    const correctIndex=lastBlock['index']+1===newBlock['index'];
    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions=[];
        res.json({
            note:"New block recieved, verified and accepted",
            newBlock:newBlock
        });
    }
    else {
        res.json({
            note:"Block rejected",
            newBlock:newBlock
        })
    }
});

app.post("/register-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  //registering the new node into the current node
  if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1)
    bitcoin.networkNodes.push(newNodeUrl);

  //broadcasting the new node to the rest of the nodes in the network
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };
    regNodesPromises.push(rp(requestOptions));
  });

  //registering all of the netwwork nodes already present inside our network with our new node
  Promise.all(regNodesPromises).then((data) => {
    const bulkRegisterOptions = {
      uri: newNodeUrl + "/register-node-bulk",
      method: "POST",
      body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
      },
      json: true,
    };
    return rp(bulkRegisterOptions)
  }).then((data) => {
      res.json({ note: "New note registered with the Network Successfully" });
  });
});

app.post('/register-node',(req,res)=>{
    const newNodeUrl=req.body.newNodeUrl;
    const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(newNodeUrl)===-1;
    const notCurrentNode=bitcoin.currentNodeUrl!==newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
    res.json({note:"New node registered successfully"});
});

app.post("/register-node-bulk", (req, res) => {
    const allNetworkNodes=req.body.allNetworkNodes;
    allNetworkNodes.forEach((networkNodeUrl)=>{
        const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(networkNodeUrl)===-1;
        const notCurrentNode=bitcoin.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note:"Bulk registration successfull"});
});

app.post("/transaction/broadcast",(req,res)=>{
    const newTransaction=bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    bitcoin.addTransactiontoPendingTransactions(newTransaction);
    const reqpromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/transaction',
            method:"POST",
            body:newTransaction,
            json:true
        }
        reqpromises.push(rp(requestOptions));
    });
    Promise.all(reqpromises).then(data=>{
        res.json({note:"Transaction created and broadcasted successfully"})
    });
});

app.get('/block/:blockHash',(req,res)=>{
    const blockHash=req.params.blockHash;
    const correctBlock=bitcoin.getBlock(blockHash);
    res.json({
        block:correctBlock
    });
});

app.get('/transaction/:transactionId',(req,res)=>{
   const transactionId=req.params.transactionId;
   const transactionData=bitcoin.getTransaction(transactionId);
   res.json({
       transaction: transactionData.transaction,
       block:transactionData.block
   })
});

app.get('/address/:address',(req, res)=>{
    const address=req.params.address;
    const addressData=bitcoin.getAddressData(address);
    res.json({
        addressData:addressData
    });
});

app.get('/block_explorer',(req,res)=>{
    res.sendFile('./block_explorer/index.html',{root: __dirname});
});

app.listen(port, () => {
  console.log(`Api working on port ${port}`);
});
