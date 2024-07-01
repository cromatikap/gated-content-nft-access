import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require('@dotenvx/dotenvx').config();

const IpalBasesModule = buildModule("IpalBasesModule", (m) => {

  const ipalBases = m.contract("GatedKnowledgeManager", ["https://arweave.net/Z9Gjl2bj793kIIIOOYlXVpHTZMRfJlicqybj8iY4KsE"]);

  return { ipalBases };
});

export default IpalBasesModule;
