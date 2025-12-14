export const parseFailures = (stdout: string, stderr: string) => {
  const out = `${stdout}\n${stderr}`
  const lines = out.split("\n")
  const failures = []
  let current = null

  for (const line of lines) {
    if (line.includes("FAIL")) {
      if (current) failures.push(current)
      current = { file: line.replace("FAIL", "").trim(), message: "", stack: [] }
    } else if (line.startsWith("  ●")) {
      if (current) current.message = line.trim()
    } else if (line.trim().startsWith("at ")) {
      if (current) current.stack.push(line.trim())
    }
  }

  if (current) failures.push(current)
  return failures
}
