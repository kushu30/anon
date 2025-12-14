import { exec } from "child_process"

export const runCommand = (cmd: string): Promise<{ stdout: string; stderr: string; code: number }> => {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      const code = error ? 1 : 0
      resolve({ stdout, stderr, code })
    })
  })
}
