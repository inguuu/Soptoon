var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
var moment = require('moment');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.get('/:episode_idx', async (req, res) => {

    const findIdxQuery = "SELECT * FROM content WHERE episode_idx=?";

    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.params.episode_idx);

    const getContentQuery = "SELECT content_img FROM content WHERE episode_idx =?";
    const getContentResult = await db.queryParam_Parse(getContentQuery, req.params.episode_idx);

    if (findIdxResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID));
    } else {

        if (!getContentResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_CONTENT_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_CONTENT_SUCCESS, getContentResult));
        }
    }

});

module.exports = router;