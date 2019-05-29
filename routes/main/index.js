var express = require('express');
var router = express.Router();

router.use("/webtoon", require("./webtoon"));
router.use("/pictures", require("./pictures"));

module.exports = router;