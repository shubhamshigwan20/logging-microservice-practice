const router = require("express").Router();
const { handleSearch } = require("../controllers/logControllers");

router.get("/logs", handleSearch);

module.exports = router;
