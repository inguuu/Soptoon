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
        const getWebtoonQuery = "SELECT * FROM webtoon WHERE done=0 ORDER BY webtoon_like";
        const getWebtoonlResult = await db.queryParam_None(getWebtoonQuery);

        if (!getWebtoonlResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_WEBTOON_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_WEBTOON_SUCCESS, getWebtoonlResult));
        }

    } else if (req.params.category == 2) {// 신규
        const getWebtoonQuery = "SELECT * FROM webtoon WHERE done=0 ORDER BY createdAt";
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



router.post('/transaction', async(req, res) => {
    const insertMenQuery = 'INSERT INTO membership (name, gender, part, univ) VALUES (?, ?, ?, ?)';
    const updatePartQuery = 'UPDATE membership SET part = ? WHERE userIdx = ?';

    //트렌젝션 처리를 하기 위한 Transaction 메소드 모듈
    const insertTransaction = await db.Transaction(async(connection) => {
        //Transaction 모듈에서 나온 connection으로 쿼리를 날림
        const insertMenResult = await connection.query(insertMenQuery, [req.body.name, req.body.gender, req.body.part, req.body.univ]);
        const userIdx = insertMenResult.insertId; //삽입된 유저의 userIdx를 가져옴
        const updatePartResult = await connection.query(updatePartQuery, ["android", userIdx]);
    });

    //실패했을 때 모듈 안에서 자동적으로 rollback을 해주고, 성공했을 때 commit을 해주기 때문에 따로 안해줘도 됨
    //저는 지금 에러처리를 몇단계 스킵햇지만 여러분은 여러분 나름대로 에러처리 꼭 해주세요.
    if (!insertTransaction) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.MEMBERSHIP_TRANSAC_FAIL));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MEMBERSHIP_TRANSAC_SUCCESS));
    }

});

module.exports = router;