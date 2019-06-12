var express = require('express');
var router = express.Router();

const upload = require('../config/multer');
var moment = require('moment');

const authUtil = require("../module/utils/authUtils");
const jwtUtils = require('../module/jwt');

const defaultRes = require('../module/utils/utils');
const statusCode = require('../module/utils/statusCode');
const resMessage = require('../module/utils/responseMessage');
const db = require('../module/pool');

router.post('/', upload.array('comment_img'), authUtil.isLoggedin, async (req, res) => {
    console.log(req.body);
    const findIdxQuery = "SELECT * FROM episode WHERE episode_idx=?";
    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.body.episode_idx);
    const findIdxQuery2 = "SELECT * FROM user WHERE user_idx=?";
    const findIdxResult2 = await db.queryParam_Parse(findIdxQuery2, req.body.comment_writer);
    if (findIdxResult[0] == null || findIdxResult2[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID_USER));
    } else {
        const insertCommentQuery =
            'INSERT INTO comment (comment_writer, comment_content,comment_datetime,episode_idx) VALUES (?,?,?,?)';
        const insertCommentImageQuery =
            'INSERT INTO comment_image (comment_idx,comment_image) VALUES (?,?)';

        const insertTransaction = await db.Transaction(async (connection) => {
            const insertCommentResult = await db.queryParam_Parse(insertCommentQuery,
                [req.body.comment_writer, req.body.comment_content, moment().format('YYYY-MM-DD HH:mm:ss'), req.body.episode_idx]);
            const commentIdx = insertCommentResult.insertId; //episode_idx

            for (let i = 0; i < req.files.length; i++) {
                insertContentResult = await connection.query(insertCommentImageQuery, [commentIdx, req.files[i].location]);
            }
        });

        if (!insertTransaction) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_COMMENT_FAILED));
        } else { //쿼리문이 성공했을 때

            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_COMMENT_SUCCESS));
        }
    }
});


/*
댓글마다 이미지 수가 다르다. 
더 좋은 방법이 있을거 같다... 데베에서 카운팅해서 빼오거나 등등 

==== 아래 방식 ===

1. 가져온 배열만큼 반복한다.
2. 댓글 idx를 비교한다. 
같으면 기존에서 이미지만 추가 
다르면 내용,사용자 등 모두 추가
3. i가 마지막일때와 마지막이 아닐때 push(item) 위치가 달라진다.
if (i < getAllCommentlResult.length - 1)// 마지막이 아닐때 
else// 마지막일때 
 
=====  결과  =====
"data": [
{
    "comment_idx": 5,
    "comment_writer": 1,
    "comment_image": [
        "https://igbb.s3.ap-northeast-2.amazonaws.com/1559628010458.jpg",
        "https://igbb.s3.ap-northeast-2.amazonaws.com/1559628010459.jpg"
    ],
    "comment_content": "131313",
    "comment_datetime": "2019-06-04T06:00:12.000Z"
},
{
    "comment_idx": 6,
    "comment_writer": 1,
    "comment_image": [
        "https://igbb.s3.ap-northeast-2.amazonaws.com/1559628021932.jpg"
    ],
    "comment_content": "131313",
    "comment_datetime": "2019-06-04T06:00:22.000Z"
}
]
*/

router.get('/:episode_idx', async (req, res) => {
    const findIdxQuery = "SELECT * FROM episode WHERE episode_idx=?";
    const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.params.episode_idx);

    if (findIdxResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_EPISODE_ID));
    } else {
        const getAllCommentQuery =
            "SELECT comment.comment_idx,comment_writer,comment_image,comment_content,comment_datetime"
            + " FROM comment JOIN comment_image ON comment.comment_idx = comment_image.comment_idx"
            + " WHERE episode_idx =? ORDER BY comment_datetime";
        const getAllCommentlResult = await db.queryParam_Parse(getAllCommentQuery, req.params.episode_idx);

        var resData = [];
        var item = {
            comment_idx: 0,
            comment_writer: 0,
            comment_image: [],
            comment_content: " ",
            comment_datetime: " "
        }

        let val = -1// 판별 값 

        for (let i = 0; i < getAllCommentlResult.length; i++) {
            let comment_idx = getAllCommentlResult[i].comment_idx;
            if (val == comment_idx) { // 댓글에서 이미지만 추가해주기 
                if (i < getAllCommentlResult.length - 1) {
                    item.comment_image.push(getAllCommentlResult[i].comment_image)
                } else {
                    item.comment_image.push(getAllCommentlResult[i].comment_image)
                    resData.push(item);
                }
            } else {// 새로운 댓글 등록
                val = comment_idx;
                if (i < getAllCommentlResult.length - 1) {
                    resData.push(item);
                    item = {
                        comment_idx: 0,
                        comment_writer: 0,
                        comment_image: [],
                        comment_content: " ",
                        comment_datetime: " "
                    }
                    item.comment_idx = getAllCommentlResult[i].comment_idx;
                    item.comment_writer = getAllCommentlResult[i].comment_writer;
                    item.comment_image.push(getAllCommentlResult[i].comment_image);
                    item.comment_content = getAllCommentlResult[i].comment_content;
                    item.comment_datetime = getAllCommentlResult[i].comment_datetime;
                } else {
                    item.comment_writer = getAllCommentlResult[i].comment_writer;
                    item.comment_image.push(getAllCommentlResult[i].comment_image);
                    item.comment_content = getAllCommentlResult[i].comment_content;
                    item.comment_datetime = getAllCommentlResult[i].comment_datetime;
                    resData.push(item);
                }

            }
        }

        if (!getAllCommentlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_COMMENT_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_COMMENT_SUCCESS, resData.slice(1)));
        }
    }

});


module.exports = router;
