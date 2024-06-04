import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { impersonate, paramsDefault } from "./utils";

describe("Ipal Gated Knowledge Manager", function () {
  async function deployGatedKnowledgeManagerFixture() {
    
    const [wallet, ...wallets] = await hre.viem.getWalletClients();
    const baseUri = "https://uri.ltd/";

    const GKM = await hre.viem.deployContract("GatedKnowledgeManager", [
      baseUri
    ]);

    return {
      wallet,
      wallets,
      baseUri,
      GKM
    };
  }

  it("Should mint an NFT with the right uri", async function () {

    /* Arrange */
    
    const { GKM, baseUri, wallets } = await loadFixture(deployGatedKnowledgeManagerFixture);
    const { resourceId, price, expirationTime } = paramsDefault;
    const [Alice, Bob] = wallets;

    let alice = await impersonate(GKM, Alice);
    let bob = await impersonate(GKM, Bob);

    await alice.write.setAccess([resourceId, price, expirationTime]);
    await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });
    await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });
    await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });

    /* Act */
    
    const tokenURI_0 = await GKM.read.tokenURI([0n]);
    const tokenURI_1 = await GKM.read.tokenURI([1n]);
    const tokenURI_2 = await GKM.read.tokenURI([2n]);

    /* Assert */
    
    expect(tokenURI_0).to.equal(`${baseUri}0`);
    expect(tokenURI_1).to.equal(`${baseUri}1`);
    expect(tokenURI_2).to.equal(`${baseUri}2`);
  });
});