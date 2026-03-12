const router = require("express").Router();
const { handleLogs } = require("../controllers/controllers");

router.post("/logs", handleLogs);
// router.post("/status", jobStatus);

module.exports = router;
