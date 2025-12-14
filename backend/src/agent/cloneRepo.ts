import { runCommand } from "../utils/exec"
import { existsSync, rmSync, mkdirSync } from "fs"
import path from "path"

export const cloneRepo = async (url: string, name: string) => {
  const repoPath = path.join(process.cwd(), "test-repos", name)

  if (existsSync(repoPath)) {
    rmSync(repoPath, { recursive: true })
  }

  mkdirSync(repoPath, { recursive: true })

  const { stdout, stderr, code } = await runCommand(`git clone ${url} ${repoPath}`)
  return { path: repoPath, stdout, stderr, code }
}
