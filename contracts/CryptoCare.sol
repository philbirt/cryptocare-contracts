pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptoCare is ERC721Token, Ownable {
  constructor() ERC721Token("CryptoCare", "CARE") public { }

  event MessageVerified(address addr);

  /**
  * @dev Mints a token to an address with a tokenURI.
  * @param _to address of the future owner of the token
  * @param _tokenURI token URI for the token
  */
  function mintTo(address _to, string _tokenURI, uint8 v, bytes32 r, bytes32 s) public payable {
    address minterAddress = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

    require(
      verifyMessage(
        keccak256(abi.encodePacked(_tokenURI)),
        v,
        r,
        s
      ) == minterAddress
    );

    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
  }

  function verifyMessage(bytes32 h, uint8 v, bytes32 r, bytes32 s) public returns (address) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(prefixedHash, v, r, s);
    emit MessageVerified(addr);
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
