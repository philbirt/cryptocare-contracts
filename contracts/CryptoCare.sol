pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CryptoCare is ERC721Token, Ownable, Pausable {
  event BeneficiaryAdded(uint8 beneficiaryId, address addr);
  event BeneficiaryRateUpdated(uint8 beneficiaryId, uint8 rate);
  event BeneficiaryActivated(uint8 beneficiaryId);
  event BeneficiaryDeactivated(uint8 beneficiaryId);

  struct beneficiaryInfo {
    address addr;
    bool isActive;
    uint8 rate;
    uint256 total;
  }

  address public minterAddress;
  mapping(uint8 => beneficiaryInfo) public beneficiaries;
  mapping(uint256 => bool) usedNonces;

  uint8 public overrideRate;
  bool public overrideRateActive;

  constructor() ERC721Token("CryptoCare", "CARE") public {
    overrideRate = 5;
    overrideRateActive = true;
  }

  /**
  * @dev Mints a token to an address with a tokenURI
  *      and sends funds to beneficiary specified
  * @param _to address of the future owner of the token
  * @param _beneficiaryId the id in beneficiaryAddresses to send the money to
  * @param _tokenURI token URI for the token metadata
  * @param _nonce nonce for the transaction
  */
  function mintTo(
    address _to, uint8 _beneficiaryId, string _tokenURI, uint256 _nonce, uint8 v, bytes32 r, bytes32 s
  ) public payable whenNotPaused returns (uint256) {
    require(msg.value > 0);
    require(!usedNonces[_nonce]);
    require(beneficiaries[_beneficiaryId].addr > 0);
    require(beneficiaries[_beneficiaryId].isActive);
    require(verifyMessage(keccak256(abi.encodePacked(_to, _tokenURI, _beneficiaryId, _nonce, msg.value)), v, r, s));
    usedNonces[_nonce] = true;

    uint256 newTokenId = mintToken(_to, _tokenURI);
    transferToBeneficiaries(msg.value, _beneficiaryId);

    return newTokenId;
  }

  /**
  * @dev Adds a beneficiary to the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  * @param addr the address of the beneficiary
  */
  function addBeneficiary(uint8 beneficiaryId, address addr) public onlyOwner whenNotPaused {
    require(beneficiaries[beneficiaryId].addr == 0);
    beneficiaries[beneficiaryId] = beneficiaryInfo(addr, true, 5, 0);
    emit BeneficiaryAdded(beneficiaryId, addr);
  }

  /**
  * @dev Updates the rate witheld for a beneficiary
  * @param beneficiaryId the identifier for the beneficiary address
  */
  function updateBeneficiaryRate(uint8 beneficiaryId, uint8 rate) public onlyOwner whenNotPaused {
    require(beneficiaries[beneficiaryId].addr > 0);
    require(rate < 100);

    beneficiaries[beneficiaryId].rate = rate;
    emit BeneficiaryRateUpdated(beneficiaryId, rate);
  }

  /**
  * @dev Activates an existing beneficiary in the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  */
  function activateBeneficiary(uint8 beneficiaryId) public onlyOwner whenNotPaused {
    require(beneficiaries[beneficiaryId].addr > 0);
    require(!beneficiaries[beneficiaryId].isActive);

    beneficiaries[beneficiaryId].isActive = true;
    emit BeneficiaryActivated(beneficiaryId);
  }

  /**
  * @dev Deactivates a beneficiary from the mapping
  * @param beneficiaryId the identifier for the beneficiary address
  */
  function deactivateBeneficiary(uint8 beneficiaryId) public onlyOwner whenNotPaused {
    require(beneficiaries[beneficiaryId].addr > 0);
    require(beneficiaries[beneficiaryId].isActive);

    beneficiaries[beneficiaryId].isActive = false;
    emit BeneficiaryDeactivated(beneficiaryId);
  }

  /**
  * @dev Updates the minter address
  * @param _addr the new minter address
  */
  function updateMinter(address _addr) public onlyOwner whenNotPaused {
    require(_addr > 0);
    minterAddress = _addr;
  }

  /**
  * @dev Updates override rate and if it is active
  * @param _active whether the override is active or not
  * @param _rate the new override rate
  */
  function updateOverrideRate(bool _active, uint8 _rate) public onlyOwner whenNotPaused {
    require(_rate < 100);
    overrideRateActive = _active;
    overrideRate = _rate;
  }

  /**
  * @dev Allows owner to withdraw funds in contract
  * @param _amount the amount to withdraw
  */
  function withdraw(uint _amount) public onlyOwner whenNotPaused returns(bool) {
    require(_amount < address(this).balance);
    owner.transfer(_amount);
    return true;
  }

  function tokensOf(address _owner) external view returns (uint256[] _ownedTokens) {
    require(_owner != address(0));
    _ownedTokens = ownedTokens[_owner];
  }

  function verifyMessage(bytes32 h, uint8 v, bytes32 r, bytes32 s) private view returns (bool) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(prefixedHash, v, r, s);
    bool verified = (addr == minterAddress);
    return verified;
  }

  function transferToBeneficiaries(uint256 amount, uint8 _beneficiaryId) private {
    beneficiaryInfo storage beneficiary = beneficiaries[_beneficiaryId];
    uint8 rate = overrideRateActive ? overrideRate : beneficiary.rate;
    uint256 beneficiaryTotal = (amount * (100 - rate))/100;

    beneficiary.addr.transfer(beneficiaryTotal);
    beneficiary.total += beneficiaryTotal;
  }

  function mintToken(address _to, string _tokenURI) private returns (uint256) {
    uint256 newTokenId = _getNextTokenId();
    _mint(_to, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
    return newTokenId;
  }

  /**
  * @dev calculates the next token ID based on totalSupply
  * @return uint256 for the next token ID
  */
  function _getNextTokenId() private view returns (uint256) {
    return totalSupply().add(1); 
  }
}
