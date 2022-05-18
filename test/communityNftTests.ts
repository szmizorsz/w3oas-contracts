/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { CommunityNFT, CommunityNFT__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("CommunityNFT", function () {
  let communityNFT: CommunityNFT;
  let communityOwner: SignerWithAddress;
  let relayer: SignerWithAddress;
  let newRelayer: SignerWithAddress;
  let nftOwner: SignerWithAddress;
  let anotherAddress: SignerWithAddress;
  let nftOwner2: SignerWithAddress;
  let nftOwner3: SignerWithAddress;
  const membershipNFTid = 1;
  const membershipNFTtokenURI = "tokenURI";

  beforeEach(async function () {
    [
      relayer,
      communityOwner,
      nftOwner,
      anotherAddress,
      newRelayer,
      nftOwner2,
      nftOwner3,
    ] = await ethers.getSigners();

    const communityNFTTokenFactory = (await ethers.getContractFactory(
      "CommunityNFT"
    )) as CommunityNFT__factory;
    communityNFT = await communityNFTTokenFactory.deploy(
      communityOwner.address,
      membershipNFTtokenURI,
      relayer.address
    );
    await communityNFT.deployed();
  });

  it("Should set the ownership and mint membership NFT during deployment", async function () {
    expect(await communityNFT.owner()).to.equal(communityOwner.address);
    expect(await communityNFT.relayer()).to.equal(relayer.address);
    expect(
      await communityNFT.balanceOf(communityOwner.address, membershipNFTid)
    ).to.equal(1);
    expect(await communityNFT.uri(membershipNFTid)).to.equal(
      membershipNFTtokenURI
    );
  });

  it("Should mint a new NFT membership from the community owner", async function () {
    await communityNFT
      .connect(communityOwner)
      .mintMembershipNFT(nftOwner.address);
    expect(
      await communityNFT.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
  });

  it("Should mint a new NFT membership from the relayer address", async function () {
    await communityNFT.connect(relayer).mintMembershipNFT(nftOwner.address);
    expect(
      await communityNFT.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
  });

  it("Should mint a new token", async function () {
    const newTokenId = 2;
    const amount = 100;
    const newTokenURI = "URI";
    await communityNFT.mint(nftOwner.address, newTokenId, amount);
    await communityNFT.setURI(newTokenId, newTokenURI);
    expect(await communityNFT.balanceOf(nftOwner.address, newTokenId)).to.equal(
      amount
    );
    expect(await communityNFT.uri(newTokenId)).to.equal(newTokenURI);
  });

  it("Should NOT mint a new token with membershipNFTtokenId", async function () {
    const amount = 100;
    await expect(
      communityNFT.mint(nftOwner.address, membershipNFTid, amount)
    ).to.be.revertedWith("Membership NFT mint not allowed");
  });

  it("Should NOT mint a new NFT membership from an address that is not the relayer or the community owner", async function () {
    await expect(
      communityNFT.connect(anotherAddress).mintMembershipNFT(nftOwner.address)
    ).to.be.revertedWith("Only owner or relayer can mint");
  });

  it("Should NOT mint a new token from an address that is not the relayer or the community owner", async function () {
    const amount = 100;
    await expect(
      communityNFT
        .connect(anotherAddress)
        .mint(nftOwner.address, membershipNFTid, amount)
    ).to.be.revertedWith("Only owner or relayer can mint");
  });

  it("Only owner can change the relayer", async function () {
    await expect(
      communityNFT.connect(anotherAddress).setRelayer(nftOwner.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("New relayer can mint membership NFT", async function () {
    await communityNFT.connect(communityOwner).setRelayer(newRelayer.address);
    await communityNFT.connect(newRelayer).mintMembershipNFT(nftOwner.address);
    expect(
      await communityNFT.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
  });

  it("Should airdrop NFT membership", async function () {
    await communityNFT.airdropMembershipNft([
      nftOwner.address,
      nftOwner2.address,
      nftOwner3.address,
    ]);
    expect(
      await communityNFT.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
    expect(
      await communityNFT.balanceOf(nftOwner2.address, membershipNFTid)
    ).to.equal(1);
    expect(
      await communityNFT.balanceOf(nftOwner3.address, membershipNFTid)
    ).to.equal(1);
  });

  it("Should airdrop NFT membership from relayer", async function () {
    await communityNFT
      .connect(relayer)
      .airdropMembershipNft([
        nftOwner.address,
        nftOwner2.address,
        nftOwner3.address,
      ]);
    expect(
      await communityNFT.balanceOf(nftOwner.address, membershipNFTid)
    ).to.equal(1);
    expect(
      await communityNFT.balanceOf(nftOwner2.address, membershipNFTid)
    ).to.equal(1);
    expect(
      await communityNFT.balanceOf(nftOwner3.address, membershipNFTid)
    ).to.equal(1);
  });

  it("Should NOT airdrop NFT membership from an address that is not the relayer or the community owner", async function () {
    await expect(
      communityNFT
        .connect(anotherAddress)
        .airdropMembershipNft([nftOwner.address])
    ).to.be.revertedWith("Only owner or relayer can mint");
  });
});
