import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProjectRegistryModule = buildModule("ProjectRegistry", (m) => {
  // Deploy ProjectRegistry
  const projectRegistry = m.contract("ProjectRegistry", []);

  return { projectRegistry };
});

export default ProjectRegistryModule;
