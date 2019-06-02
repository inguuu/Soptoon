var express = require('express');
var router = express.Router();

router.use("/view", require("./view"));
router.use("/visit", require("./visit"));

module.exports = router;