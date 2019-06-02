var express = require('express');
var router = express.Router();


router.use("/user", require("./user/index"));
router.use("/main", require("./main/index"));
router.use("/comment", require("./comment"));
router.use("/webtoon", require("./webtoon/index"));
router.use("/content", require("./content/index"));
module.exports = router;
