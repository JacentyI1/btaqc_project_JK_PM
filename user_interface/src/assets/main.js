//require sha256 hash function
const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('087a54abd0190bc80c44f0349c07fbf23b589d19f9119c954b48d2ab3c2ca92d');
const myWalletAddress = myKey.getPublic('hex');

let jackCoin = new Blockchain();

const tr1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tr1.signTransaction(myKey);
jackCoin.addTransaction(tr1);

console.log('\n Starting the miner...');
jackCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Jack\'s wallet is', jackCoin.getBalanceOfAddress(myWalletAddress));

jackCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', jackCoin.isChainValid());


