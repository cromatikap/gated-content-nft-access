import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require('@dotenvx/dotenvx').config();

const IpalBasesModule = buildModule("IpalBasesModule", (m) => {

  const ipalBases = m.contract("GatedKnowledgeManager", ["https://tbd.ltd/"]);

  return { ipalBases };
});

export default IpalBasesModule;
