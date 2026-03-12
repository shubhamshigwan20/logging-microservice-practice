const express = require("express");
const db = require("./db/db");
const { Worker } = require("bullmq");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
// const router = require("./routes/appRoutes");
const PORT = process.env.PORT;

app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
    message: "consumer-service running",
  });
});

const worker = new Worker(
  "logs_queue",
  async (job) => {
    console.log(`started processing ${job.id}`);
    const level = job.data.level;
    const service = job.data.service;
    const message = job.data.message;
    const timestamp = job.data.timestamp;

    const result = await db.query(`INSERT INTO logs VALUES ($1, $2, $3, $4)`, [
      level,
      service,
      message,
      timestamp,
    ]);
    if (!result.rowCount) {
      throw new Error("failed inserting data to db");
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`data inserted to db for job ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(
    `failed inserting data in db for job ${job.id} with error ${err}`,
  );
});

app.listen(PORT, () => {
  console.log(`server started on PORT ${PORT}`);
});
