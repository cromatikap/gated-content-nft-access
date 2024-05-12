import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Ipal Gated Knowledge Manager", function () {
  async function deployGatedKnowledgeManagerFixture() {
    const baseUri = "https://uri.ltd/";

    const GKM = await hre.viem.deployContract("GatedKnowledgeManager", [
      baseUri
    ]);

    return {
      GKM,
      baseUri
    };
  }

  it("Should mint an NFT with the right uri", async function () {
    /* Arrange */
    const { GKM, baseUri } = await loadFixture(deployGatedKnowledgeManagerFixture);

    /* Act */
    console.log("WIP");

    /* Assert */
    expect(true).to.equal(true);
  });
});