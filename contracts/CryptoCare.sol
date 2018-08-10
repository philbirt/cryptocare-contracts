pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptoCare is ERC721Token, Ownable {
  constructor() ERC721Token("CryptoCare", "CARE") public { }

  /**
  * @dev Mints a token to an address with a tokenURI.
  * @param _to address of the future owner of the token
  * @param _tokenURI token URI for the token
  */
  function mintTo(
    address _to,
    string _tokenURI
  ) public payable {
    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
  }

  function verifyMessage(bytes32 h, uint8 v, bytes32 r, bytes32 s) pure public returns (address) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(prefixedHash, v, r, s);
    return addr;
  }

  function tokensOf(address _owner) external view returns (uint256[] _ownedTokens) {
    require(_owner != address(0));
    _ownedTokens = ownedTokens[_owner];
  }

  /**
  * @dev calculates the next token ID based on totalSupply
  * @return uint256 for the next token ID
  */
  function _getNextTokenId() private view returns (uint256) {
    return totalSupply().add(1); 
  }
}
