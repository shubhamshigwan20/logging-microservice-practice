const api = require("../api/axiosPrivate");
require("dotenv").config();

const handleLogs = async (req, res, next) => {
  try {
    const { level, service, message } = req.body;
    // validate data

    const payload = {
      level,
      service,
      message,
      timestamp: new Date().toLocaleString(),
    };

    const result = api.post("/publish", payload);

    if (result.status === 200) {
      return res.status(200).json({
        status: true,
        message: result.data.message,
      });
    }
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

module.exports = { handleLogs };
