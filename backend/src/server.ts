import express from "express"
import agentRoute from "./routes/agentRoute"

const app = express()
app.use(express.json())
app.use("/run", agentRoute)

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

app.listen(4000)
