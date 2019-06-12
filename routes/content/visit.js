var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
var moment = require('moment');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.put('/', async (req, res) => {

    const findIdxQuery = "SELECT visit FROM episode WHERE episode_idx=?";
    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.body.episode_idx);//성공시 에피소드의 방문수가 등록된다.
    if (findIdxResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID));
    } else {
        let renewalVisit = ++(findIdxResult[0].visit);
        const increaseQuery = "UPDATE episode SET visit = ? WHERE episode_idx= ?";
        const increaseResult = await db.queryParam_Parse(increaseQuery, [renewalVisit, req.body.episode_idx]);
        if (!increaseResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INCREASE_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INCREASE_SUCCESS));
        }
    }



});

module.exports = router;