const { Module } = require("module");
const sha = require("sha256");

class Blockchain {
  constructor() {
    //contains all the blocks that are being mined
    this.chain = [];
    //contains all the pending transactions
    this.pendingTransactions = [];

    Blockchain.prototype.createNewBlock = (nonce, previousBlockHash, hash) => {
      const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        //include all the pending transactions into this block
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
      };

      //as all the pending transactions have been recorded, clearing the array for pending transactions
      this.pendingTransactions = [];
      this.chain.push(newBlock);
      return newBlock;
    };

    Blockchain.prototype.getLastBlock = () => {
      return [this.chain.length - 1];
    };

    Blockchain.prototype.createNewTransaction = (amount, sender, recipient) => {
      const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
      };
      this.pendingTransactions.push(newTransaction);
      //
      return this.getLastBlock()["index"] + 1;
    };

    Blockchain.prototype.hashBlock = (prevBlockHash, currBlockData, nonce) => {
      const dataAsString =
        prevBlockHash + nonce.toString() + JSON.stringify(currBlockData);
      const hash = sha(dataAsString);
      return hash;
    };

    Blockchain.prototype.proofofWork = (previousBlockHash, currBlockData) => {
      let nonce = 0;
      let hash = this.hashBlock(previousBlockHash, currBlockData, nonce);
      while (hash.substring(0, 4) !== "0000") {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currBlockData, nonce);
      }
      return nonce;
    };

    //to create the genesis block(i.e. first block of the blockchain)
    this.createNewBlock(100, "0", "0");
  }
}

module.exports = Blockchain;
