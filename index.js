require("dotenv").config();

const express = require("express");
const { handler } = require("./api/check");

const app = express();

const PORT = Number(process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "api-monitor",
    time: new Date().toISOString(),
  });
});

// Manual trigger: GET /check?token=...
app.get("/check", async (req, res) => {
  try {
    const response = handler(req, res);
  } catch (e) {}
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
