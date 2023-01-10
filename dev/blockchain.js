const {Module} = require("module");
const sha = require("sha256");
const {v4: uuid} = require("uuid");
const currentNodeUrl = process.argv[3];

class Blockchain {
    constructor() {
        //contains all the blocks that are being mined
        this.chain = [];
        //contains all the pending transactions
        this.pendingTransactions = [];
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

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
            return this.chain[this.chain.length - 1];
        };

        Blockchain.prototype.createNewTransaction = (amount, sender, recipient) => {
            const newTransaction = {
                amount: amount,
                sender: sender,
                recipient: recipient,
                transactionId: uuid().split('-').join('')
            };
            return newTransaction;
        };

        Blockchain.prototype.addTransactiontoPendingTransactions = (transactionObj) => {
            this.pendingTransactions.push(transactionObj);
            return this.getLastBlock()['index'] + 1;
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

        Blockchain.prototype.chainIsValid = (blockchain) => {
            let chainIsValid = true;
            for (var i = 1; i < blockchain.length; i++) {
                const currentBlock = blockchain[i];
                const prevBlock = blockchain[i - 1];
                const blockHash = this.hashBlock(prevBlock['hash'], {
                    transactions: currentBlock['transactions'],
                    index: currentBlock['index']
                }, currentBlock['nonce']);
                if (blockHash.substring(0, 4) !== '0000')
                    chainIsValid = false;
                if (currentBlock['previousBlockHash'] !== prevBlock['hash'])
                    chainIsValid = false;

                console.log('previousBlockHash: ',prevBlock['hash']);
                console.log('currentBlockHash: ', currentBlock['hash']);
            }
            ;

            const genesisBlock = blockchain[0];
            const correctNonce = genesisBlock['nonce'] === 100;
            const correctPrevBlockHash = genesisBlock['previousBlockHash'] === '0';
            const correctHash = genesisBlock['hash'] === '0';
            const correctTransactions = genesisBlock['transactions'].length === 0;
            if (!correctHash || !correctNonce || !correctPrevBlockHash || !correctTransactions)
                chainIsValid = false;

            return chainIsValid;
        };

        Blockchain.prototype.getBlock=(blockHash)=>{
            let correctBlock=null;
            this.chain.forEach(block=>{
                if(block.hash===blockHash)
                    correctBlock=block;
            });
            return correctBlock;
        }

        Blockchain.prototype.getTransaction=(transactionId)=>{
            let correctTransaction=null;
            let correctBlock=null;
            this.chain.forEach(block=>{
                block.transactions.forEach(transaction=>{
                    if(transaction.transactionId===transactionId){
                        correctTransaction=transaction;
                        correctBlock=block;
                    }
                });
            });

            return {
                transaction: correctTransaction,
                block: correctBlock
            }
        }

        Blockchain.prototype.getAddressData=(address)=>{
            const addressTransactions=[];
            this.chain.forEach(block=>{
                block.transactions.forEach(transaction=>{
                    if(transaction.sender===address || transaction.recipient===address){
                        addressTransactions.push(transaction);
                    }
                });
            });
            let balance=0;
            addressTransactions.forEach(transaction=>{
                if(transaction.recipient===address)
                    balance+=transaction.amount;
                else if(transaction.sender===address)
                    balance-=transaction.amount;
            });

            return {
                addressTransactions: addressTransactions,
                addressBalance: balance
            }
        }

        //to create the genesis block(i.e. first block of the blockchain)
        this.createNewBlock(100, "0", "0");
    }
}

module.exports = Blockchain;
