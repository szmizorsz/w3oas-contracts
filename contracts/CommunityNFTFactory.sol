//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CommunityNFT.sol";

contract CommunityNFTFactory is Ownable {
  address public relayer;
  mapping(uint256 => CommunityNFT) nftContractsByCommunityId;

  constructor(address _relayer) {
    relayer = _relayer;
  }

  function deployCommunityNFT(
    uint256 communityId,
    address communityOwner,
    string memory membershipNFTuri
  ) public onlyRelayerOrOwner {
    CommunityNFT communityNFT = new CommunityNFT(
      communityOwner,
      membershipNFTuri,
      relayer
    );
    nftContractsByCommunityId[communityId] = communityNFT;
  }

  function getCommunityNftById(uint256 id) public view returns (CommunityNFT) {
    return nftContractsByCommunityId[id];
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
