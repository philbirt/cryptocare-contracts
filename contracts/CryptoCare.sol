pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptoCare is ERC721Token, Ownable {
  event MessageVerified(address addr, bool verified);
  event BeneficiaryAdded(uint8 beneficiaryId, address addr);
  event BeneficiaryActivated(uint8 beneficiaryId);
  event BeneficiaryDeactivated(uint8 beneficiaryId);

  struct beneficiaryInfo {
    address addr;
    bool isActive;
    uint256 total;
  }

  mapping(uint8 => beneficiaryInfo) public beneficiaries;
  address public minterAddress;

  constructor() ERC721Token("CryptoCare", "CARE") public {
    minterAddress = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
    beneficiaries[1] = beneficiaryInfo(0x7E155a0d7AB1ecEc24E9cCaA99104291655014C8, true, 0);
    beneficiaries[2] = beneficiaryInfo(0xafBCC39f474baf9596C1135522810d5f409DDE0F, true, 0);
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
    require(beneficiaries[_beneficiaryId].addr > 0);
    require(beneficiaries[_beneficiaryId].isActive);
    require(verifyMessage(keccak256(abi.encodePacked(_tokenURI)), v, r, s));

    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);

    beneficiaries[_beneficiaryId].addr.transfer(msg.value);
    beneficiaries[_beneficiaryId].total += (msg.value * 95)/100;
  }

  /**
  * @dev Adds a beneficiary to the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  * @param addr the address of the beneficiary
  */
  function addBeneficiary(uint8 beneficiaryId, address addr) public onlyOwner {
    require(beneficiaries[beneficiaryId].addr == 0);
    beneficiaries[beneficiaryId] = beneficiaryInfo(addr, true, 0);
    emit BeneficiaryAdded(beneficiaryId, addr);
  }

  /**
  * @dev Activates an existing beneficiary in the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  */
  function activateBeneficiary(uint8 beneficiaryId) public onlyOwner {
    require(beneficiaries[beneficiaryId].addr > 0);
    require(!beneficiaries[beneficiaryId].isActive);

    beneficiaries[beneficiaryId].isActive = true;
    emit BeneficiaryActivated(beneficiaryId);
  }

  /**
  * @dev Deactivates a beneficiary from the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  */
  function deactivateBeneficiary(uint8 beneficiaryId) public onlyOwner {
    require(beneficiaries[beneficiaryId].addr > 0);
    require(beneficiaries[beneficiaryId].isActive);

    beneficiaries[beneficiaryId].isActive = false;
    emit BeneficiaryDeactivated(beneficiaryId);
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

  function verifyMessage(bytes32 h, uint8 v, bytes32 r, bytes32 s) public returns (bool) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(prefixedHash, v, r, s);
    bool verified = (addr == minterAddress);
    emit MessageVerified(addr, verified);
    return verified;
  }

  /**
  * @dev calculates the next token ID based on totalSupply
  * @return uint256 for the next token ID
  */
  function _getNextTokenId() private view returns (uint256) {
    return totalSupply().add(1); 
  }
}
