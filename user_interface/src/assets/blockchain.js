const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash(){
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }
  
  signTransaction(signingKey){
    if(signingKey.getPublic('hex') !== this.fromAddress){
      throw new Error('You cannot sign transactions fo other wallets!')
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid(){
    // check  if address is null
    if(this.fromAddress === null) return true;
    // ckeck if there is a signature
    if(!this.signature || this.signature.length ===0){
      throw new Error('No signature in this transaction');
    }
    // extract the public key & verify if transaction was signed by that key
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block{
  constructor(timestamp, transactions, previousHash=''){
    this.timestamp=timestamp;
    this.transactions= transactions;
    this.previousHash=previousHash;
    this.hash=this.calculateHash();
    this.nonce = 0;
  }

  //return sha256 ahsh function
  calculateHash(){
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  // proof of work
  mineBlock(difficulty){
    //make a string of '0' that is the length of 'difficulty'
    while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
      this.nonce++;
      this.hash=this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }

  hasValidTransactions(){
    for(const tx of this.transactions){
      if(!tx.isValid()){
        return false;
      }
    }
    return true;
  }
}



class Blockchain{
  constructor(){
    this.chain=[this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions =[];
    this.miningReward = 100;
  }

  createGenesisBlock(){
    return new Block("01/01/2023", "Genesis block", "0")
  }

  getLatesBlock(){
    return this.chain[this.chain.length-1];
  }

  // // adding a new block onto the chain
  // addBlock(newBlock){
  //   // set the previous hash to the last block on the chain
  //   newBlock.previousHash = this.getLatesBlock().hash;
  //   // recalculate the hash
  //   // newBlock.hash = newBlock.calculateHash();
  //   newBlock.mineBlock(this.difficulty);
  //   // push it onto the chain
  //   this.chain.push(newBlock);
  // }

  minePendingTransactions(miningRewardAddress){
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatesBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction){
    // to and from address is filled in
    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error('Transaction must include from and to address');
    }
    //verify the validity of the transaction
    if(!transaction.isValid()){
      throw new Error('Cannot add invalid transaction to chain');
    }
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address){
    let balance = 0;

    for(const block of this.chain){
      for(const trans of block.transactions){
        if(trans.fromAddress === address){
          balance -= trans.amount;
        }
        if(trans.toAddress === address){
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  isChainValid(){
    //start from the block after the genesis
    for(let i = 1; i< this.chain.length; i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i-1];
      // check if the current block has not all valid transactions
      if(!currentBlock.hasValidTransactions()){
        // blockchain is in an invalid state
        return false;
      }
      if(currentBlock.hash !== currentBlock.calculateHash()){
        return false;
      }
      if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;