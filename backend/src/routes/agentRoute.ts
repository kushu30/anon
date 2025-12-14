import express from "express"
import { cloneRepo } from "../agent/cloneRepo"
import { runTests } from "../agent/runTests"
import { parseFailures } from "../agent/parseFailures"

const router = express.Router()

router.post("/", async (req, res) => {
  const { repoUrl, name } = req.body
  const cloned = await cloneRepo(repoUrl, name)
  const testResult = await runTests(cloned.path)

  const failures = parseFailures(
    testResult.test.stdout,
    testResult.test.stderr
  )

  res.json({ failures })
})

export default router
