import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, encodePacked } from "viem";

describe("ERC4908", function () {
  async function deployERC4908ExampleFixture() {

    const [wallet, ...wallets] = await hre.viem.getWalletClients();
    const erc4908Example = await hre.viem.deployContract("ERC4908Example", []);
    
    return {
      erc4908Example,
      wallet,
      wallets
    };
  }

  const Mock = {
    contentId: BigInt(1),
    price: BigInt(2),
    expirationTime: 3
  };

  /*
   * { impersonateAccount } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
   * doesn't work so here is the home made version
   */
  const impersonate = async (contract: any, account: any) =>
    await hre.viem.getContractAt(
      "ERC4908Example",
      contract.address,
      { client: { wallet: account } }
    );


  describe("Author actions", function () {
    it("Should set access", async function () {

      /* Arrange */

      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = Mock;

      const expectedHash = keccak256(encodePacked(
        ['address', 'uint256'],
        [wallet.account.address, contentId]
      ));

      /* Act */

      await erc4908Example.write.setAccess([contentId, price, expirationTime])
      const access = await erc4908Example.read.accessControl([expectedHash]);

      /* Assert */

      expect(access[0]).to.equal(contentId);
      expect(access[1]).to.equal(price);
      expect(access[2]).to.equal(expirationTime);
    });

    it("Should check if access exists", async function () {

      /* Arrange */

      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = Mock;

      const expectedHash = keccak256(encodePacked(
        ['address', 'uint256'],
        [wallet.account.address, contentId]
      ));

      /* Act */

      const before = await erc4908Example.read.existAccess([expectedHash]);
      await erc4908Example.write.setAccess([contentId, price, expirationTime]);
      const after = await erc4908Example.read.existAccess([expectedHash]);

      /* Assert */

      expect(before).to.equal(false);
      expect(after).to.equal(true);
    })

    it("Should delete access", async function () {

      /* Arrange */
      
      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = Mock;
      
      const expectedHash = keccak256(encodePacked(
        ['address', 'uint256'],
        [wallet.account.address, contentId]
      ));

      await erc4908Example.write.setAccess([contentId, price, expirationTime]);

      /* Act */

      const before = {
        exists: await erc4908Example.read.existAccess([expectedHash]),
        settings: await erc4908Example.read.accessControl([expectedHash])
      };
      await erc4908Example.write.delAccess([contentId]);
      const after = { 
        exists: await erc4908Example.read.existAccess([expectedHash]),
        settings: await erc4908Example.read.accessControl([expectedHash])
      };

      /* Assert */

      expect(before.exists).to.equal(true);
      expect(after.exists).to.equal(false);
      // Check if all settings are reset
      expect(before.settings[0]).to.equal(contentId);
      expect(before.settings[1]).to.equal(price);
      expect(before.settings[2]).to.equal(expirationTime);
      expect(after.settings[0]).to.equal(0n);
      expect(after.settings[1]).to.equal(0n);
      expect(after.settings[2]).to.equal(0);
    });
  });

  describe("Access minting", function () {
    it("Should mint an NFT", async function () {

      /* Arrange */

      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = Mock;
      const [Alice, Bob] = wallets;

      let contract = await impersonate(erc4908Example, Alice);
      await contract.write.setAccess([contentId, price, expirationTime]);

      /* Act */

      /* 
        Test revertWith but doesn't have access to this method
        This project initialization with viem sucks and need to be changed
        too much tools are missing
      */
      // expect(contract.write.mint([Bob.account.address, contentId, Alice.account.address])).to.be.revertedWith("ERC4908: author hasn't activated mint access for this contentId");

      contract = await impersonate(erc4908Example, Bob);
      await contract.write.mint([Alice.account.address, contentId, Bob.account.address]);

      /* Assert */

      expect(await erc4908Example.read.totalSupply()).to.equal(1n);
    });
  });

  describe("Resources access check", function () {
    it("Should have access", async function () {
      /* Arrange */
      const { erc4908Example } = await loadFixture(deployERC4908ExampleFixture);

      /* Act */
      console.log("WIP");

      /* Assert */
      expect(true).to.equal(true);
    });

    it("Should not have access", async function () {
      /* Arrange */
      const { erc4908Example } = await loadFixture(deployERC4908ExampleFixture);

      /* Act */
      console.log("WIP");

      /* Assert */
      expect(true).to.equal(true);
    });
  });
});