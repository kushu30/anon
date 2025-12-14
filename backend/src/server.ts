import "dotenv/config";
import express from "express";
import agentRoute from "./routes/agentRoute";

const app = express();
app.use(express.json());

// Routes
app.use("/", agentRoute);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Railway requires dynamic port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`anon backend running on port ${PORT}`);
});
