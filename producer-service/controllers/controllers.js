const { Queue } = require("bullmq");
require("dotenv").config();

const logsQueue = new Queue("logs_queue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

const addJob = async (req, res) => {
  const { level, service, message, timestamp } = req.body;
  // validate data

  const payload = {
    level,
    service,
    message,
    timestamp,
  };
  const result = await logsQueue.add("job1", payload);
  return res.status(200).json({
    status: true,
    message: `job ${result.id} successfully added to queue`,
  });
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
