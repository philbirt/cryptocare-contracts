pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract IpfsStorage is Ownable {
  string ipfsHash;
 
  function setHash(string x) public {
    ipfsHash = x;
  }

  function getHash() public view returns (string x) {
    return ipfsHash;
  }
}
