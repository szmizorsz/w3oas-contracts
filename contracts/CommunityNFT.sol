//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CommunityNFT is ERC1155URIStorage, Ownable {
  address public relayer;
  uint256 constant membershipNFTid = 1;

  constructor(
    address communityOwner,
    string memory membershipNFTuri,
    address _relayer
  ) ERC1155("") {
    relayer = _relayer;
    transferOwnership(communityOwner);
    _mint(communityOwner, membershipNFTid, 1, "");
    _setURI(membershipNFTid, membershipNFTuri);
  }

  function mintMembershipNFT(address nftOwner) public onlyRelayerOrOwner {
    _mint(nftOwner, membershipNFTid, 1, "");
  }

  function mint(
    address nftOwner,
    uint256 tokenId,
    uint256 amount
  ) public onlyRelayerOrOwner {
    require(tokenId != membershipNFTid, "Membership NFT mint not allowed");
    _mint(nftOwner, tokenId, amount, "");
  }

  function airdropMembershipNft(address[] memory recepients)
    public
    onlyRelayerOrOwner
  {
    for (uint256 i = 0; i < recepients.length; i++) {
      mintMembershipNFT(recepients[i]);
    }
  }

  function setURI(uint256 tokenId, string memory tokenURI)
    public
    onlyRelayerOrOwner
  {
    _setURI(tokenId, tokenURI);
  }

  function setRelayer(address _relayer) public onlyOwner {
    relayer = _relayer;
  }

  modifier onlyRelayerOrOwner() {
    require(
      msg.sender == relayer || msg.sender == owner(),
      "Only owner or relayer can mint"
    );
    _;
  }
}
