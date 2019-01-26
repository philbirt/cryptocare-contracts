pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CryptoCareToken is ERC721Token, Ownable, Pausable {
    event TokenURIUpdated(uint256 _tokenID, string _tokenURI);

    address public minterAddress;

    constructor() public ERC721Token("CryptoCare", "CARE") {}

    /**
    * @dev Throws if called by any account other than the minter.
    */
    modifier onlyMinter() {
        require(msg.sender == minterAddress);
        _;
    }

    /**
    * @dev Mints a new token with given tokenURI for an address
    * @param _to the address to mint the token to
    * @param _tokenURI the token URI containing the token metadata
    */
    function mintToken(address _to, string _tokenURI) public onlyMinter whenNotPaused returns (uint256) {
        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        return newTokenId;
    }

    /**
    * @dev Updates the token URI for a given token ID
    * @param _tokenID the token ID to update
    */
    function updateTokenURI(uint256 _tokenID, string _tokenURI) public onlyMinter whenNotPaused {
        _setTokenURI(_tokenID, _tokenURI);
        emit TokenURIUpdated(_tokenID, _tokenURI);
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
    * @dev calculates the next token ID based on totalSupply
    * @return uint256 for the next token ID
    */
    function _getNextTokenId() private view returns (uint256) {
        return totalSupply().add(1);
    }
}
