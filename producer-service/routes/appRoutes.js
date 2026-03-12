const router = require("express").Router();
const { addJob } = require("../controllers/controllers");

router.post("/publish", addJob);
// router.post("/status", jobStatus);

module.exports = router;
