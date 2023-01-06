const bodyParser = require("body-parser");
const express = require("express");
var app = express();
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

app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const prevBlockHash = lastBlock["hash"];

  const currBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = bitcoin.proofofWork(prevBlockHash, currBlockData);

  const hash = bitcoin.hashBlock(prevBlockHash, currBlockData, nonce);

  bitcoin.createNewTransaction(0.25, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash, hash);

  res.json({ note: "New Block mined successfully", block: newBlock });
});

app.post("/transaction", (req, res) => {
  const blockIndex = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  res.json({ note: `Transaction will be added to the block ${blockIndex}` });
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
        allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currenNodeUrl],
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
    const notCurrentNode=bitcoin.currenNodeUrl!==newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
    res.json({note:"New node registered successfully"});
});

app.post("/register-node-bulk", (req, res) => {
    const allNetworkNodes=req.body.allNetworkNodes;
    allNetworkNodes.forEach((networkNodeUrl)=>{
        const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(networkNodeUrl)===-1;
        const notCurrentNode=bitcoin.currenNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note:"Bulk registration successfull"});
});

app.listen(port, () => {
  console.log(`Api working on port ${port}`);
});
