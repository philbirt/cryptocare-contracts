pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptoCare is ERC721Token, Ownable {
  event MessageVerified(address addr);

  mapping(uint8 => address) public beneficiaryAddresses;
  mapping(uint8 => uint256) public beneficiaryTotals;
  address public minterAddress;

  constructor() ERC721Token("CryptoCare", "CARE") public {
    minterAddress = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
    beneficiaryAddresses[1] = 0x7E155a0d7AB1ecEc24E9cCaA99104291655014C8;
    beneficiaryAddresses[2] = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
  }

  /**
  * @dev Mints a token to an address with a tokenURI
  *      and sends funds to beneficiary specified
  * @param _to address of the future owner of the token
  * @param _beneficiaryId the id in beneficiaryAddresses to send the money to
  * @param _tokenURI token URI for the token metadata
  */
  function mintTo(address _to, uint8 _beneficiaryId, string _tokenURI, uint8 v, bytes32 r, bytes32 s) public payable {
    require(msg.value > 0);
    require(beneficiaryAddresses[_beneficiaryId] > 0);
    require(verifyMessage(keccak256(abi.encodePacked(_tokenURI)), v, r, s));

    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
    beneficiaryAddresses[_beneficiaryId].transfer(msg.value);
    beneficiaryTotals[_beneficiaryId] += msg.value;
  }

  /**
  * @dev Adds a beneficiary to the mapping
  * @param _id the identifier for the beneficiary address
  * @param _addr the address of the beneficiary
  */
  function addBeneficiary(uint8 _id, address _addr) public onlyOwner {
    require(beneficiaryAddresses[_id] == 0);
    beneficiaryAddresses[_id] = _addr;
  }

  /**
  * @dev Removes a beneficiary from the mapping
  * @param _id the identifier for the beneficiary address
  */
  function removeBeneficiary(uint8 _id) public onlyOwner {
    require(beneficiaryAddresses[_id] > 0);
    beneficiaryAddresses[_id] = 0;
  }

  /**
  * @dev Updates the minter address
  * @param _addr the new minter address
  */
  function updateMinter(address _addr) public onlyOwner {
    require(_addr > 0);
    minterAddress = _addr;
  }

  function tokensOf(address _owner) external view returns (uint256[] _ownedTokens) {
    require(_owner != address(0));
    _ownedTokens = ownedTokens[_owner];
  }

  function verifyMessage(bytes32 h, uint8 v, bytes32 r, bytes32 s) private returns (bool) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(prefixedHash, v, r, s);
    emit MessageVerified(addr);
    return addr == minterAddress;
  }

  /**
  * @dev calculates the next token ID based on totalSupply
  * @return uint256 for the next token ID
  */
  function _getNextTokenId() private view returns (uint256) {
    return totalSupply().add(1); 
  }
}
