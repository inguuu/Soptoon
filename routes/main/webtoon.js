var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
var moment = require('moment');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.get('/:category', async (req, res) => {

    if (req.params.category == 1) {// 인기순
        const getWebtoonQuery = "SELECT * FROM webtoon ORDER BY webtoon_like";
        const getWebtoonlResult = await db.queryParam_None(getWebtoonQuery);

        if (!getWebtoonlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_WEBTOON_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_WEBTOON_SUCCESS, getWebtoonlResult));
        }

    } else if (req.params.category == 2) {// 신규
        const getWebtoonQuery = "SELECT * FROM webtoon ORDER BY createdAt";
        const getWebtoonlResult = await db.queryParam_None(getWebtoonQuery);

        if (!getWebtoonlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_WEBTOON_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_WEBTOON_SUCCESS, getWebtoonlResult));
        }


    } else if (req.params.category == 3) {// 완료
        const getWebtoonQuery = "SELECT * FROM webtoon WHERE done=1";
        const getWebtoonlResult = await db.queryParam_None(getWebtoonQuery);

        if (!getWebtoonlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_WEBTOON_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_WEBTOON_SUCCESS, getWebtoonlResult));
        }


    } else {// category에 1,2,3만 넣어달라고 하기
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NO_CATEGORY));
    }

});
router.post('/', upload.single('webtoon_img'), async (req, res) => {
    const insertWebtoonQuery =
        'INSERT INTO webtoon (webtoon_img, webtoon_title, webtoon_like,writer,done,createdAt) VALUES (?,?,?,?,?,?)';
    const insertWebtoonResult = await db.queryParam_Parse(insertWebtoonQuery,
        [req.file.location, req.body.webtoon_title, req.body.webtoon_like, req.body.writer, req.body.done, moment().format('YYYY-MM-DD HH:mm:ss')]);


    if (!insertWebtoonResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_WEBTOON_FAILED));
    } else { //쿼리문이 성공했을 때

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_WEBTOON_SUCCESS));
    }


});

module.exports = router;