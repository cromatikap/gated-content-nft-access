import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, encodePacked } from "viem";
import { impersonate, paramsDefault } from "./utils";

describe("ERC4908", function () {
  async function deployERC4908ExampleFixture() {

    const [wallet, ...wallets] = await hre.viem.getWalletClients();
    const erc4908Example = await hre.viem.deployContract("ERC4908Example", []);
    
    return {
      wallet,
      wallets,
      erc4908Example
    };
  }

  describe("Author actions", function () {
    it("Should set access", async function () {

      /* Arrange */

      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = paramsDefault;

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
      const { contentId, price, expirationTime } = paramsDefault;

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
      const { contentId, price, expirationTime } = paramsDefault;
      
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
      const { contentId, price, expirationTime } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([contentId, price, expirationTime]);

      /* Act */

      const mintUnavailableContent = alice.write.mint([
        Bob.account.address, 
        contentId, 
        Alice.account.address
      ])

      const mintAvailableContent = bob.write.mint([
        Alice.account.address,
        contentId,
        Bob.account.address
      ])

      /* Assert */
      
      await expect(mintUnavailableContent).to.be.rejectedWith(
        'MintUnavailable("0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06")'
      );
      await expect(mintAvailableContent).to.be.fulfilled;
      expect(await erc4908Example.read.totalSupply()).to.equal(1n);
    });
  });

  describe("Resources access check", function () {
    it("Should have access", async function () {
      /* Arrange */
      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { contentId, price, expirationTime } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([contentId, price, expirationTime]);

      /* Act */
      await bob.write.mint([Alice.account.address, contentId, Bob.account.address]);

      const hasAccess = await erc4908Example.read.hasAccess([Alice.account.address, contentId, Bob.account.address]);

      /* Assert */
      expect(hasAccess).to.equal(true);
    });

    it("Should not have access", async function () {
      /* Arrange */
      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const [Alice, Bob, Charlie] = wallets;
      const { contentId, price, expirationTime } = paramsDefault;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([contentId, price, expirationTime]);

      /* Act */

      const hasAccessBob = await erc4908Example.read.hasAccess([Alice.account.address, contentId, Bob.account.address])

      await bob.write.mint([Alice.account.address, contentId, Bob.account.address]);

      const hasAccessCharlie = await erc4908Example.read.hasAccess([Alice.account.address, contentId, Charlie.account.address]);

      /* Assert */
      expect(hasAccessBob).to.equal(false);     
      expect(hasAccessCharlie).to.equal(false);
    })
  })
})