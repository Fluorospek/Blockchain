const express = require("express");
const app = express();
const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/blockchain", (req, res) => {
    res.send(bitcoin);
});

app.post("/transaction", (req, res) => {
    const blockIndex = bitcoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );
    res.json({note: `Transaction will be addded to the block ${blockIndex}`});
});

const port = 5000;
app.listen(port, () => {
    console.log(`Api working on port ${port}`);
});
