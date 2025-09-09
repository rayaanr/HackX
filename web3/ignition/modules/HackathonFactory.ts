import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("HackathonFactoryModule", (m) => {
  const hackathonFactory = m.contract("HackathonFactory");

  return { hackathonFactory };
});
