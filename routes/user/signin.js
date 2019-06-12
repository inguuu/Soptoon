var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

const jwtUtils = require('../../module/jwt');

router.post('/', async (req, res) => {
    const selectUserQuery = 'SELECT * FROM user WHERE user_id = ?'
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, req.body.user_id);
    //console.log(selectUserResult[0])//유저 정보

    if (selectUserResult[0] == null) {//id가 존재하지 않으면
        console.log("id가 존재하지 않음");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_CORRECT_USERINFO));
    } else {
        const salt = selectUserResult[0].salt;
        const hashedEnterPw = await crypto.pbkdf2(req.body.user_pw.toString(), salt, 1000, 32, 'SHA512');

        if (selectUserResult[0].user_pw == hashedEnterPw.toString('base64')) {
            const tokens = jwtUtils.sign(selectUserResult[0]);
            const refreshToken = tokens.refreshToken;
            const refreshTokenUpdateQuery = "UPDATE user SET refresh_token = ? WHERE user_id= ?";
            const refreshTokenUpdateResult = await db.queryParam_Parse(refreshTokenUpdateQuery, [refreshToken, req.body.user_id]);
            if (!refreshTokenUpdateResult) {
                res.status(200).send(defaultRes.successTrue(statusCode.DB_ERROR, "refreshtoken DB등록 오류 "));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SIGNIN_SUCCESS, tokens));
            }

        } else {
            console.log("비밀번호가 일치하지 않음");
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_CORRECT_USERINFO));
        }
    }

});

module.exports = router;
