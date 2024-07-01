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
  resourceId: "7f0e683bd119688847070f0a4476d078b95399a2843ca1c549cdcdbafee0792f",
  price: BigInt(2),
  expirationTime:  Math.floor(Date.now() / 1000) + 3600 // 1 hour in to future
};

async function increaseTime(seconds: number) {
  await hre.network.provider.request({
    method: "evm_increaseTime",
    params: [seconds],
  });
  await hre.network.provider.request({
    method: "evm_mine",
    params: [],
  });
}

export { impersonate, paramsDefault, increaseTime };