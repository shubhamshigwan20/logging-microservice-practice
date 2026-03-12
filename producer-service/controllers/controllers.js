const { Queue } = require("bullmq");
// const Redis = require("ioredis");
require("dotenv").config();

const logsQueue = new Queue("logs_queue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const addJob = async (req, res, next) => {
  try {
    const { level, service, message } = req.body;
    // validate data

    const payload = {
      level,
      service,
      message,
      timestamp: new Date().toISOString(),
    };

    // const redis = new Redis({ url: process.env.REDIS_URL });
    // const jobId = await redis.incr("job");
    const result = await logsQueue.add("log", payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
    return res.status(200).json({
      status: true,
      message: `job ${result.id} successfully added to queue`,
    });
  } catch (err) {
    next(err);
  }
};

// const jobStatus = async (req, res) => {
//   const { level, service, message, timestamp } = req.body;
//   // validate data

//   const payload = {
//     level,
//     service,
//     message,
//     timestamp,
//   };
//   const result = await logsQueue.add("job1", payload);
//   return res.status(200).json({
//     status: true,
//     message: `job ${result.id} successfully added to queue`,
//   });
// };

module.exports = { addJob };
