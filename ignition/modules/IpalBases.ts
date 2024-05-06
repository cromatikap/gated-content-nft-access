import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require('@dotenvx/dotenvx').config();

const IpalBasesModule = buildModule("IpalBasesModule", (m) => {

  const ipalBases = m.contract("GatedKnowledgeManager", [
    process.env.CONTRACT_OWNER || "0x746D791F5D5853894F6888cA735528Bb19DE1912",
    "https://tbd.ltd/"
  ]);

  return { ipalBases };
});

export default IpalBasesModule;
