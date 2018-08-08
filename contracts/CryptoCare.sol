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
    string _tokenURI,
    bytes _signedTokenURI,
    string _charityID
  ) public payable {
    bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, _tokenURI, this)));
    require(recoverSigner(message, _signedTokenURI) == owner);

    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);

    // send money to the charity
    // add amount to the correct counter
  }

  function tokensOf(address _owner) external view returns (uint256[] _ownedTokens) {
    require(_owner != address(0));
    _ownedTokens = ownedTokens[_owner];
  }

  function recoverSigner(bytes32 message, bytes signedMessage) internal pure returns (address) {
    uint8 v;
    bytes32 r;
    bytes32 s;

    (v, r, s) = splitSignature(signedMessage);

    return ecrecover(message, v, r, s);
  }

  function splitSignature(bytes sig) internal pure returns (uint8, bytes32, bytes32) {
    require(sig.length == 65);

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      // first 32 bytes, after the length prefix
      r := mload(add(sig, 32))
      // second 32 bytes
      s := mload(add(sig, 64))
      // final byte (first byte of the next 32 bytes)
      v := byte(0, mload(add(sig, 96)))
    }
    return (v, r, s);
  }

  // Builds a prefixed hash to mimic the behavior of eth_sign.
  function prefixed(bytes32 hash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
  }

  /**
  * @dev calculates the next token ID based on totalSupply
  * @return uint256 for the next token ID
  */
  function _getNextTokenId() private view returns (uint256) {
    return totalSupply().add(1); 
  }
}
