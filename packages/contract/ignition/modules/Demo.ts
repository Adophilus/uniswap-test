import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'

const DemoModule = buildModule("DemoModule", (m) => {
  const demo = m.contract("Demo", [PERMIT2_ADDRESS]);

  return { demo };
});

export default DemoModule;
