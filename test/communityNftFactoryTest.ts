/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  CommunityNFTFactory,
  CommunityNFTFactory__factory,
  // eslint-disable-next-line node/no-missing-import
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("CommunityNFTFactory", function () {
  let communityNFTFactory: CommunityNFTFactory;
  let communityOwner: SignerWithAddress;
  let relayer: SignerWithAddress;
  let anotherAddress: SignerWithAddress;
  let nftOwner: SignerWithAddress;
  const membershipNFTtokenURI = "tokenURI";

  beforeEach(async function () {
    [relayer, communityOwner, anotherAddress, nftOwner] =
      await ethers.getSigners();

    const communityNFTFactoryFactory = (await ethers.getContractFactory(
      "CommunityNFTFactory"
    )) as CommunityNFTFactory__factory;
    communityNFTFactory = await communityNFTFactoryFactory.deploy(
      relayer.address
    );
    await communityNFTFactory.deployed();
  });

  it("Should deploy a communityNFT contract", async function () {
    const communityId = 1;
    await communityNFTFactory
      .connect(relayer)
      .deployCommunityNFT(
        communityId,
        communityOwner.address,
        membershipNFTtokenURI
      );
    const communityNFTcontract = await communityNFTFactory.getCommunityNftById(
      communityId
    );
    expect(ethers.utils.isAddress(communityNFTcontract)).to.equal(true);
    // we can check if the address is a contract address
    const provider = ethers.getDefaultProvider();
    expect(await provider.getCode(communityNFTcontract)).to.equal("0x");
  });

  it("Should NOT deploy a communityNFT contract from an address that is not the relayer or the owner", async function () {
    const communityId = 1;
    await expect(
      communityNFTFactory
        .connect(anotherAddress)
        .deployCommunityNFT(
          communityId,
          communityOwner.address,
          membershipNFTtokenURI
        )
    ).to.be.revertedWith("Only owner or relayer can mint");
  });

  it("Should deploy a communityNFT contract and then mint an NFT", async function () {
    const communityId = 1;
    await communityNFTFactory
      .connect(relayer)
      .deployCommunityNFT(
        communityId,
        communityOwner.address,
        membershipNFTtokenURI
      );
    const communityNFTcontractAddress =
      await communityNFTFactory.getCommunityNftById(communityId);
    const communityNFTcontract = await ethers.getContractAt(
      "CommunityNFT",
      communityNFTcontractAddress
    );

    const membershipNFTid = 1;
    await communityNFTcontract
      .connect(communityOwner)
      .mintMembershipNFT(nftOwner.address);
    expect(
      await communityNFTcontract.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
  });
});
