var express = require('express');
var router = express.Router();


const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

const authUtil = require("../../module/utils/authUtils");
const jwtUtils = require('../../module/jwt');
router.post('/', authUtil.isLoggedin, async (req, res) => {
    const selectUserQuery = 'SELECT * FROM likelist WHERE user_idx = ? AND webtoon_idx= ?'
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, [req.decoded.idx, req.body.webtoon_idx]);

    if (!req.body.webtoon_idx) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NULL_VALUE));
    } else {
        if (selectUserResult[0]==null) {
            const insertLikeListQuery =
                'INSERT INTO likelist (user_idx,webtoon_idx) VALUES (?,?)';
            const updateLikeQuery = 'UPDATE webtoon SET webtoon_like = webtoon_like+1 WHERE webtoon_idx = ?';

            const insertTransaction = await db.Transaction(async (connection) => {
                const insertLikeListResult = await connection.query(insertLikeListQuery,
                    [req.decoded.idx, req.body.webtoon_idx])
                const updateLikeResult = await connection.query(updateLikeQuery, [req.body.webtoon_idx]);
            });
            if (!insertTransaction) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_LIKE_FAILED));
            } else { //쿼리문이 성공했을 때
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_LIKE_SUCCESS));
            }
        } else {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, "이미 좋아요 상태입니다."));
        }
    }

});

router.delete('/', authUtil.isLoggedin, async (req, res) => {
    const selectUserQuery = 'SELECT * FROM likelist WHERE user_idx = ? AND webtoon_idx=?'
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, [req.decoded.idx, req.body.webtoon_idx]);
    if (!req.body.webtoon_idx) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NULL_VALUE));
    } else {
        if (selectUserResult[0] != null) {
            const deleteLikeListQuery =
                'DELETE FROM likelist WHERE user_idx=? AND webtoon_idx=?';
            const updateLikeQuery = 'UPDATE webtoon SET webtoon_like = webtoon_like-1 WHERE webtoon_idx = ?';
            const deleteTransaction = await db.Transaction(async (connection) => {
                const deleteLikeListResult = await db.queryParam_Parse(deleteLikeListQuery,
                    [req.decoded.idx, req.body.webtoon_idx])
                const updateLikeResult = await connection.query(updateLikeQuery, [req.body.webtoon_idx]);
            });
            if (!deleteTransaction) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.DELETE_LIKE_FAILED));
            } else { //쿼리문이 성공했을 때
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.DELETE_LIKE_SUCCESS));
            }
        } else {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, "좋아요 상태가 아닙니다."));
        }
    }
});



module.exports = router;