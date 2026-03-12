const db = require("./db/db");
const { Queue, Worker } = require("bullmq");
require("dotenv").config();

const dlq = new Queue("logs_dlq", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const worker = new Worker(
  "logs_queue",
  async (job) => {
    console.log(`started processing ${job.id}`);
    const level = job.data.level;
    const service = job.data.service;
    const message = job.data.message;
    const timestamp = job.data.timestamp;

    const result = await db.query(
      `INSERT INTO logs(level, service, message, timestamp) VALUES ($1, $2, $3, $4)`,
      [level, service, message, timestamp],
    );
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

worker.on("failed", async (job, err) => {
  const attemptsLeft = job.attemptsMade < job.opts.attempts;
  if (attemptsLeft) return;
  await dlq.add("logs_failed", {
    originalJobId: job.id,
    payload: job.data,
    error: err.message,
    failedAt: new Date().toISOString(),
  });

  console.log(`job ${job.id} moved to DLQ`);
});
