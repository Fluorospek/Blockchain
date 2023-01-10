const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const bc1={
    "chain": [
        {
            "index": 1,
            "timestamp": 1673091458142,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1673091580118,
            "transactions": [],
            "nonce": 18140,
            "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1673091582464,
            "transactions": [
                {
                    "amount": 0.25,
                    "sender": "00",
                    "recipient": "eb35a1717cf14b91a8c5e99f560a0416",
                    "transactionId": "c10ae11889ba499ea8f7dab53aa3b670"
                }
            ],
            "nonce": 58309,
            "hash": "00000303ca1cd374254b76584b9c359e65225b15528c42a8be1af3eaeb6d89ab",
            "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
        },
        {
            "index": 4,
            "timestamp": 1673091645389,
            "transactions": [
                {
                    "amount": 0.25,
                    "sender": "00",
                    "recipient": "eb35a1717cf14b91a8c5e99f560a0416",
                    "transactionId": "6929e78c4da943ff908db1585a44923c"
                },
                {
                    "amount": 3,
                    "sender": "yuiojkyvhbjk",
                    "recipient": "ddvubifcghbjn",
                    "transactionId": "ec870059f60d4de19ab539d9b1532c50"
                },
                {
                    "amount": 300,
                    "sender": "yuiojkyvhbjk",
                    "recipient": "ddvubifcghbjn",
                    "transactionId": "4f80b8ff87174119932a9d1e3f93c777"
                }
            ],
            "nonce": 3909,
            "hash": "00007b901479b0935ecc8f764c4d6b742d10d3e7866ee69284bb391eb85424f5",
            "previousBlockHash": "00000303ca1cd374254b76584b9c359e65225b15528c42a8be1af3eaeb6d89ab"
        },
        {
            "index": 5,
            "timestamp": 1673091710111,
            "transactions": [
                {
                    "amount": 0.25,
                    "sender": "00",
                    "recipient": "eb35a1717cf14b91a8c5e99f560a0416",
                    "transactionId": "2bb6f87a78954e44a9696ac4afd0bfaf"
                },
                {
                    "amount": 20,
                    "sender": "yuiojkyvhbjk",
                    "recipient": "ddvubifcghbjn",
                    "transactionId": "782bf66cfcf548528bc07f75d789412c"
                },
                {
                    "amount": 10,
                    "sender": "yuiojkyvhbjk",
                    "recipient": "ddvubifcghbjn",
                    "transactionId": "a4623a6fc6874aa7a651830900b8be3b"
                }
            ],
            "nonce": 42305,
            "hash": "0000bc71d86d62ee9b32fcc077b75071a13069191bad6d3fe35cdf459e8eb0a3",
            "previousBlockHash": "00007b901479b0935ecc8f764c4d6b742d10d3e7866ee69284bb391eb85424f5"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 0.25,
            "sender": "00",
            "recipient": "eb35a1717cf14b91a8c5e99f560a0416",
            "transactionId": "8075d1463aa44c788efa5e64c3d8c0e4"
        }
    ],
    "currentNodeUrl": "http://localhost:5001",
    "networkNodes": []
}

console.log('VALID: ',bitcoin.chainIsValid(bc1.chain));
