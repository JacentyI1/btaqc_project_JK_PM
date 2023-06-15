//require sha256 hash function
const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const jacKey = ec.keyFromPrivate('087a54abd0190bc80c44f0349c07fbf23b589d19f9119c954b48d2ab3c2ca92d');
const jacekWalletAddress = jacKey.getPublic('hex');
const przKey = ec.keyFromPrivate('097a54abd0190bc80c44f0sjgc07fbf23b589d19f9119c954b48d2ab3c2ca92d');
const przemekWalletAddress = przKey.getPublic('hex');


let JPCoin = new Blockchain();

const tr1 = new Transaction(jacekWalletAddress, przemekWalletAddress, 10);
const tr2 = new Transaction(przemekWalletAddress, jacekWalletAddress, 10);

// tr1.signTransaction(jacKey);
// JPCoin.addTransaction(tr1);

const tr3 = new Transaction(przemekWalletAddress, jacekWalletAddress, 25);
tr2.signTransaction(przKey);
JPCoin.addTransaction(tr2);

for(let i = 1; i< 10; i++){
  const tr3 = new Transaction(przemekWalletAddress, jacekWalletAddress, 25+i);
  tr3.signTransaction(przKey);
  JPCoin.addTransaction(tr3);
  JPCoin.minePendingTransactions(przemekWalletAddress);
}

// console.log('\n Starting the miner...');
JPCoin.minePendingTransactions(jacekWalletAddress);

console.log('\nBalance of Jack\'s wallet is', JPCoin.getBalanceOfAddress(jacekWalletAddress));
console.log('\nBalance of Przemek\'s wallet is', JPCoin.getBalanceOfAddress(przemekWalletAddress));

// jackCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', JPCoin.isChainValid());



