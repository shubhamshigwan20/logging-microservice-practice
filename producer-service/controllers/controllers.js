const { Queue } = require("bullmq");
// const Redis = require("ioredis");
require("dotenv").config();

let jobId = 0;

const logsQueue = new Queue("logs_queue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const addJob = async (req, res, next) => {
  try {
    const { level, service, message, timestamp } = req.body;
    // validate data

    const payload = {
      level,
      service,
      message,
      timestamp,
    };

    // const redis = new Redis({ url: process.env.REDIS_URL });
    // const jobId = await redis.incr("job");
    jobId += 1;
    const result = await logsQueue.add(`job-${jobId}`, payload);
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
