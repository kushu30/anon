import express from "express"
import { cloneRepo } from "../agent/cloneRepo"
import { runTests } from "../agent/runTests"
import { parseFailures } from "../agent/parseFailures"
import { generateRootCause } from "../agent/rootCause"

const router = express.Router()

router.post("/", async (req, res) => {
  const { repoUrl, name } = req.body

  const cloned = await cloneRepo(repoUrl, name)
  const testResult = await runTests(cloned.path)
  const failures = parseFailures(testResult.test.stdout, testResult.test.stderr)
  const rootCause = generateRootCause(failures)

  res.json({
    failures,
    rootCause
  })
})

export default router
