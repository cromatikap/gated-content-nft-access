import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, encodePacked } from "viem";
import { impersonate, increaseTime, paramsDefault } from "./utils";

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
      const { resourceId, price, expirationDuration } = paramsDefault;

      const expectedHash = keccak256(encodePacked(
        ['address', 'string'],
        [wallet.account.address, resourceId]
      ));

      /* Act */

      await erc4908Example.write.setAccess([resourceId, price, expirationDuration])
      const access = await erc4908Example.read.accessControl([expectedHash]);

      /* Assert */

      expect(access[0]).to.equal(resourceId);
      expect(access[1]).to.equal(price);
      expect(access[2]).to.equal(expirationDuration);
    });

    it("Should check if access exists using hash", async function () {

      /* Arrange */

      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;

      const expectedHash = keccak256(encodePacked(
        ['address', 'string'],
        [wallet.account.address, resourceId]
      ));

      /* Act */

      const before = await erc4908Example.read.existAccess([expectedHash]);
      await erc4908Example.write.setAccess([resourceId, price, expirationDuration]);
      const after = await erc4908Example.read.existAccess([expectedHash]);

      /* Assert */

      expect(before).to.equal(false);
      expect(after).to.equal(true);
    });

    it("Should check if access exists using author + resourceId", async function () {

      /* Arrange */

      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;

      /* Act */

      const before = await erc4908Example.read.existAccess([wallet.account.address, resourceId]);
      await erc4908Example.write.setAccess([resourceId, price, expirationDuration]);
      const after = await erc4908Example.read.existAccess([wallet.account.address, resourceId]);

      /* Assert */

      expect(before).to.equal(false);
      expect(after).to.equal(true);
    });

    it("Should delete access", async function () {

      /* Arrange */
      
      const { erc4908Example, wallet } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;
      
      const expectedHash = keccak256(encodePacked(
        ['address', 'string'],
        [wallet.account.address, resourceId]
      ));

      await erc4908Example.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */

      const before = {
        exists: await erc4908Example.read.existAccess([expectedHash]),
        settings: await erc4908Example.read.accessControl([expectedHash])
      };
      await erc4908Example.write.delAccess([resourceId]);
      const after = { 
        exists: await erc4908Example.read.existAccess([expectedHash]),
        settings: await erc4908Example.read.accessControl([expectedHash])
      };

      /* Assert */

      expect(before.exists).to.equal(true);
      expect(after.exists).to.equal(false);
      // Check if all settings are reset
      expect(before.settings[0]).to.equal(resourceId);
      expect(before.settings[1]).to.equal(price);
      expect(before.settings[2]).to.equal(expirationDuration);
      expect(after.settings[0]).to.equal("");
      expect(after.settings[1]).to.equal(0n);
      expect(after.settings[2]).to.equal(0);
    });
  });

  describe("Access minting", function () {
    it("Should get access control values", async function () {

      /* Arrange */

      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */

      const accessControl = await bob.read.getAccessControl([Alice.account.address ,resourceId]);

      /* Assert */

      expect(accessControl[0]).to.equal(price);
      expect(accessControl[1]).to.equal(expirationDuration);
    });

    it("Should test if NFT minting is available", async function () {

      /* Arrange */

      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */

      const mintUnavailableContent = alice.write.mint([
        Bob.account.address, 
        resourceId, 
        Alice.account.address
      ], { value: price })

      const mintAvailableContent = bob.write.mint([
        Alice.account.address,
        resourceId,
        Bob.account.address
      ], { value: price })

      /* Assert */
      
      await expect(mintUnavailableContent).to.be.rejectedWith(
        'MintUnavailable("0x64b7b2d2900f927ae778f84917c8327d63cbb08f59126c14ead77f45b28ab7dd")'
      );  
      await expect(mintAvailableContent).to.be.fulfilled; 
    });

    it("Should check if the expected NFT price is met", async function () {
      
      /* Arrange */

      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */
      
      const mintInsufficientFunds = bob.write.mint([
        Alice.account.address,
        resourceId,
        Bob.account.address
      ], { value: price - 1n })

      const mintSufficientFunds = bob.write.mint([
        Alice.account.address,
        resourceId,
        Bob.account.address
      ], { value: price })


      /* Assert */

      await expect(mintInsufficientFunds).to.be.rejectedWith(
        'InsufficientFunds(2)'
      );
      await expect(mintSufficientFunds).to.be.fulfilled;
    });
  });

  describe("Resources access check", function () {
    it("Should have access", async function () {
      /* Arrange */
      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const { resourceId, price, expirationDuration } = paramsDefault;
      const [Alice, Bob] = wallets;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */
      const [hasAccessBeforeMint, messageBeforeMint] = await erc4908Example.read.hasAccess([Alice.account.address, resourceId, Bob.account.address]);
      await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });
      const [hasAccessAfterMint, messageAfterMint] = await erc4908Example.read.hasAccess([Alice.account.address, resourceId, Bob.account.address]);

      /* Assert */
      expect(hasAccessBeforeMint).to.equal(false);
      expect(messageBeforeMint).to.equal("user doesn't own the NFT");
      expect(hasAccessAfterMint).to.equal(true);
      expect(messageAfterMint).to.equal("access granted");
    });

    it("Should not have access", async function () {
      /* Arrange */
      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const [Alice, Bob, Charlie] = wallets;
      const { resourceId, price, expirationDuration } = paramsDefault;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      await alice.write.setAccess([resourceId, price, expirationDuration]);

      /* Act */
      await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });
      const [hasAccessCharlie, messageCharlie] = await erc4908Example.read.hasAccess([Alice.account.address, resourceId, Charlie.account.address]);

      /* Assert */
      expect(hasAccessCharlie).to.equal(false);
      expect(messageCharlie).to.equal("user doesn't own the NFT");
    });

    it("Should detect expired access", async function () {
      /* Arrange */
      const { erc4908Example, wallets } = await loadFixture(deployERC4908ExampleFixture);
      const [Alice, Bob] = wallets;
      const { resourceId, price, expirationDuration } = paramsDefault;

      let alice = await impersonate(erc4908Example, Alice);
      let bob = await impersonate(erc4908Example, Bob);

      /* Act */
      await alice.write.setAccess([resourceId, price, expirationDuration]);
      await bob.write.mint([Alice.account.address, resourceId, Bob.account.address], { value: price });
      await increaseTime(1)
      const [hasAccessBeforeExpiration, messageBeforeExpiration] = await erc4908Example.read.hasAccess([Alice.account.address, resourceId, Bob.account.address])
      await increaseTime(3)
      const [hasAccessAfterExpiration, messageAfterExpiration] = await erc4908Example.read.hasAccess([Alice.account.address, resourceId, Bob.account.address]);

      /* Assert */
      expect(hasAccessBeforeExpiration).to.equal(true);
      expect(messageBeforeExpiration).to.equal("access granted");
      expect(hasAccessAfterExpiration).to.equal(false);
      expect(messageAfterExpiration).to.equal("access is expired");
    });
  });
});
