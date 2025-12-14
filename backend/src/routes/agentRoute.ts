import express from "express"
import { cloneRepo } from "../agent/cloneRepo"
import { runTests } from "../agent/runTests"

const router = express.Router()

router.post("/", async (req, res) => {
  const { repoUrl, name } = req.body
  const cloned = await cloneRepo(repoUrl, name)
  const testResult = await runTests(cloned.path)
  res.json(testResult)
})

export default router
