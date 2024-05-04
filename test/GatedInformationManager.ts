import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Ipal Gated Knowledge Manager", function () {
  async function deployGatedKnowledgeManagerFixture() {
    const [owner] = await hre.viem.getWalletClients();
    const baseUri = "https://uri.ltd/";

    const GKM = await hre.viem.deployContract("GatedKnowledgeManager", [
      owner.account.address,
      baseUri
    ]);

    return {
      GKM,
      owner,
      baseUri
    };
  }

  it("Should mint an NFT with the right uri", async function () {
    console.log("WIP");

    // const { GKM, baseUri } = await loadFixture(deployGatedKnowledgeManagerFixture);

    // await GKM.read.tokenURI([BigInt(1)])
    // // expect(await GKM.read.tokenURI([BigInt(10)])).to.equal(baseUri + "10.json");
  });
});