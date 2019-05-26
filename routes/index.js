var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use("/signin", require("./signin"));
router.use("/signup", require("./signup"));
router.use("/comment", require("./comment"));

module.exports = router;
