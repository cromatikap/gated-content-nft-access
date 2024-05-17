import hre from "hardhat";

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


const paramsDefault = {
  contentId: BigInt(1),
  price: BigInt(2),
  expirationTime: 3
};

export { impersonate, paramsDefault };