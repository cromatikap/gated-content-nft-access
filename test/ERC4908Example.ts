import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { keccak256, encodePacked } from "viem";

describe("ERC4908", function () {
  async function deployERC4908ExampleFixture() {

    const [wallet] = await hre.viem.getWalletClients();
    const erc4908Example = await hre.viem.deployContract("ERC4908Example" as "Example", []);

    return {
      erc4908Example,
      wallet
    };
  }

  describe("Author actions", function () {
    it("Should set access", async function () {
      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);

      const contentId = BigInt(1);
      const price = BigInt(2);
      const expirationTime = 3;
      const accessHash = keccak256(encodePacked(
        ['address', 'uint256'],
        [wallet.account.address, contentId]
      ));

      await erc4908Example.write.setAccess([contentId, price, expirationTime])
      const access = await erc4908Example.read.accessControl([accessHash]);

      expect(access[0]).to.equal(contentId);
      expect(access[1]).to.equal(price);
      expect(access[2]).to.equal(expirationTime);
    });

    it("Should delete access", async function () {
      console.log("WIP");
    });
  });

  describe("Customer actions", function () {
    it("Should mint an NFT", async function () {
      const { erc4908Example } = await loadFixture(deployERC4908ExampleFixture);
      console.log("WIP");
    });
  });

  describe("Resources access check", function () {
    it("Should have access", async function () {
      console.log("WIP");
    });

    it("Should not have access", async function () {
      console.log("WIP");
    });
  });
});