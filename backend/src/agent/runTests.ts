import { runCommand } from "../utils/exec"

export const runTests = async (path: string) => {
  const install = await runCommand(`cd ${path} && npm install`)
  const test = await runCommand(`cd ${path} && npm test`)
  return { install, test }
}
