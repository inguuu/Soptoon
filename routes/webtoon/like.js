var express = require('express');
var router = express.Router();


const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.post('/', async (req, res) => {//insert 쿼리 두개 나중에 트랜잭션으로 바꾸기 


    const insertLikeListQuery =
        'INSERT INTO likelist (user_idx,webtoon_idx) VALUES (?,?)';
    const insertLikeListResult = await db.queryParam_Parse(insertLikeListQuery,
        [req.body.user_idx, req.body.webtoon_idx])

    if (!insertLikeListResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_LIKE_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_LIKE_SUCCESS));
    }

});
router.delete('/', async (req, res) => {

    const deleteLikeListQuery =
        'DELETE FROM likelist WHERE user_idx=? AND webtoon_idx=?';
    const deleteLikeListResult = await db.queryParam_Parse(deleteLikeListQuery,
        [req.body.user_idx, req.body.webtoon_idx])

    if (!deleteLikeListResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DELETE_LIKE_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.DELETE_LIKE_SUCCESS));
    }

});



module.exports = router;