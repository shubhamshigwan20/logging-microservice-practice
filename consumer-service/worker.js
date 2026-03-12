const db = require("./db/db");
const { Queue, Worker } = require("bullmq");
require("dotenv").config();

const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 1000;

const pending = [];
let flushing = false;
let flushTimer = null;

const dlq = new Queue("logs_dlq", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

function buildInsert(rows) {
  const values = [];
  const placeholders = rows
    .map((row, i) => {
      const base = i * 4;
      values.push(row.level, row.service, row.message, row.timestamp);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    })
    .join(", ");

  return {
    text: `INSERT INTO logs(level, service, message, timestamp) VALUES ${placeholders}`,
    values,
  };
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

async function flush() {
  if (flushing || pending.length === 0) return;
  flushing = true;

  const batch = pending.splice(0, BATCH_SIZE);
  try {
    const rows = batch.map((b) => b.job.data);
    const { text, values } = buildInsert(rows);

    const result = await db.query(text, values);
    if (result.rowCount !== batch.length) {
      throw new Error("batch insert rowCount mismatch");
    }

    batch.forEach((b) => b.resolve());
  } catch (err) {
    batch.forEach((b) => b.reject(err));
  } finally {
    flushing = false;
    if (pending.length > 0) flush();
  }
}

function enqueue(job) {
  return new Promise((resolve, reject) => {
    pending.push({ job, resolve, reject });
    if (pending.length >= BATCH_SIZE) {
      flush();
    } else {
      scheduleFlush();
    }
  });
}

const worker = new Worker("logs_queue", (job) => enqueue(job), {
  connection: {
    url: process.env.REDIS_URL,
  },
});

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
