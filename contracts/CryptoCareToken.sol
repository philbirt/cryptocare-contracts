pragma solidity 0.4.25;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract CryptoCareToken is ERC721Token, Ownable, Pausable {
    address public minterAddress;

    constructor() public ERC721Token("CryptoCare", "CARE") {}

    function mintToken(address _to, string _tokenURI) public whenNotPaused returns (uint256) {
        require(msg.sender == minterAddress);

        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        return newTokenId;
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
