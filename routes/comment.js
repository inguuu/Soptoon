var express = require('express');
var router = express.Router();

const upload = require('../config/multer');
var moment = require('moment');

const defaultRes = require('../module/utils/utils');
const statusCode = require('../module/utils/statusCode');
const resMessage = require('../module/utils/responseMessage');
const db = require('../module/pool');

router.post('/', upload.single('comment_img'), async (req, res) => {

    const insertCommentQuery =
        'INSERT INTO comment (comment_writer, comment_img, comment_content,comment_datetime) VALUES (?,?,?,?)';
    const insertCommentResult = await db.queryParam_Parse(insertCommentQuery,
        [req.body.comment_writer, req.file.location, req.body.comment_content, moment().format('YYYY-MM-DD HH:mm:ss')]);


    if (!insertCommentResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_COMMENT_FAILED));
    } else { //쿼리문이 성공했을 때

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_COMMENT_SUCCESS));
    }
});

router.get('/', async (req, res) => {

    const getAllCommentQuery = "SELECT * FROM comment ORDER BY comment_datetime";
    const getAllCommentlResult = await db.queryParam_None(getAllCommentQuery);

    if (!getAllCommentlResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_COMMENT_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_COMMENT_SUCCESS, getAllCommentlResult));
    }

});


module.exports = router;
