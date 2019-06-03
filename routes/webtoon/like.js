var express = require('express');
var router = express.Router();


const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.post('/', async (req, res) => {

    const insertLikeListQuery =
        'INSERT INTO likelist (user_idx,webtoon_idx) VALUES (?,?)';
    const updateLikeQuery = 'UPDATE webtoon SET webtoon_like = webtoon_like+1 WHERE webtoon_idx = ?';

    const insertTransaction = await db.Transaction(async (connection) => {
        const insertLikeListResult = await connection.query(insertLikeListQuery,
            [req.body.user_idx, req.body.webtoon_idx])
        const updateLikeResult = await connection.query(updateLikeQuery, [req.body.webtoon_idx]);
    });
    if (!insertTransaction) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_LIKE_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_LIKE_SUCCESS));
    }

});



router.delete('/', async (req, res) => {

    const deleteLikeListQuery =
        'DELETE FROM likelist WHERE user_idx=? AND webtoon_idx=?';
    const updateLikeQuery = 'UPDATE webtoon SET webtoon_like = webtoon_like-1 WHERE webtoon_idx = ?';
    const deleteTransaction = await db.Transaction(async (connection) => {
        const deleteLikeListResult = await db.queryParam_Parse(deleteLikeListQuery,
            [req.body.user_idx, req.body.webtoon_idx])
        const updateLikeResult = await connection.query(updateLikeQuery, [req.body.webtoon_idx]);
    });
    if (!deleteTransaction) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DELETE_LIKE_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.DELETE_LIKE_SUCCESS));
    }

});



module.exports = router;