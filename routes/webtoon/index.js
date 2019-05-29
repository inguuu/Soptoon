var express = require('express');
var router = express.Router();

router.use("/episode", require("./episode"));
router.use("/like", require("./like"));

module.exports = router;