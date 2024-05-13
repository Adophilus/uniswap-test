import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DemoModule = buildModule("DemoModule", (m) => {
  const demo = m.contract("Demo");

  return { demo };
});

export default DemoModule;
