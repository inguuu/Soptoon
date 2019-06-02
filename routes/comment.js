var express = require('express');
var router = express.Router();

const upload = require('../config/multer');
var moment = require('moment');

const defaultRes = require('../module/utils/utils');
const statusCode = require('../module/utils/statusCode');
const resMessage = require('../module/utils/responseMessage');
const db = require('../module/pool');

router.post('/', upload.single('comment_img'), async (req, res) => {
    console.log(req.body);
    const findIdxQuery = "SELECT * FROM episode WHERE episode_idx=?";
    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.body.episode_idx);
    if (findIdxResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID));
    } else {
        const insertCommentQuery =
            'INSERT INTO comment (comment_writer, comment_img, comment_content,comment_datetime,episode_idx) VALUES (?,?,?,?,?)';
        const insertCommentResult = await db.queryParam_Parse(insertCommentQuery,
            [req.body.comment_writer, req.file.location, req.body.comment_content, moment().format('YYYY-MM-DD HH:mm:ss'), req.body.episode_idx]);


        if (!insertCommentResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_COMMENT_FAILED));
        } else { //쿼리문이 성공했을 때

            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_COMMENT_SUCCESS));
        }
    }
});

router.get('/:episode_idx', async (req, res) => {
    const findIdxQuery = "SELECT * FROM episode WHERE episode_idx=?";
    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.params.episode_idx);

    if (findIdxResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID));
    } else {
        const getAllCommentQuery =
            "SELECT comment_writer,comment_img,comment_content,comment_datetime FROM comment WHERE episode_idx =? ORDER BY comment_datetime";
        const getAllCommentlResult = await db.queryParam_Parse(getAllCommentQuery, req.params.episode_idx);

        if (!getAllCommentlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_COMMENT_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_COMMENT_SUCCESS, getAllCommentlResult));
        }
    }

});


module.exports = router;
