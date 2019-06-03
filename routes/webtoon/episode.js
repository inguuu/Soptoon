var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
var moment = require('moment');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.get('/:webtoon_idx/:user_idx', async (req, res) => {

    const getEpisodesQuery =
        "SELECT * FROM episode WHERE webtoon_idx = ?";
    const getEpisodesResult = await db.queryParam_Parse(getEpisodesQuery, [req.params.webtoon_idx]);

    if (getEpisodesResult[0] == null) {// 에피소드 아이디가 없으면 실패
        res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_WEBTOON_ID));
    } else {
        var likeState = 0;// 0: 좋아요 X , 1: 좋아요 O
        const getLikeQuery =
            "SELECT * FROM likelist WHERE webtoon_idx = ? AND user_idx=?";
        const getLikeResult = await db.queryParam_Parse(getLikeQuery, [req.params.webtoon_idx, req.params.user_idx]);

        if (getLikeResult[0] == null) {
            likeState = 0;
        } else {
            likeState = 1;
        }
        let ResData = {
            likeState,
            getEpisodesResult
        }
        if (!getEpisodesResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_EPISODE_FAILED));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EPISODE_SUCCESS, ResData));
        }
    }
});
router.post('/', upload.array('images'), async (req, res) => {

    if (req.files.length < 2) {// 썸네일 1, 내용 1 최소한 들어가야함 
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.AT_LEAST_IMAGES));
    } else {
        const findIdxQuery = "SELECT * FROM webtoon WHERE webtoon_idx=?";
        const findIdxResult = await db.queryParam_Parse(findIdxQuery, req.body.webtoon_idx);
        if (findIdxResult[0] == null) {// 웹툰아이디가 없으면 실패
            res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FOUND_WEBTOON_ID));
        } else {
            let thumbnail_img = req.files[0];
            let content_img = req.files.slice(1);
            const insertEpisodeQuery =
                'INSERT INTO episode (thumbnail_img, episode_title, webtoon_idx,createdAt,visit) VALUES (?,?,?,?,?)';
            const insertContentQuery =
                'INSERT INTO content (episode_idx,content_img) VALUES (?,?)';

            const insertTransaction = await db.Transaction(async (connection) => {
                const insertEpisodeResult = await connection.query(insertEpisodeQuery,
                    [thumbnail_img.location, req.body.episode_title, req.body.webtoon_idx, moment().format('YYYY-MM-DD HH:mm:ss'), 0]);
                const episodeIdx = insertEpisodeResult.insertId; //episode_idx

                for (let i = 0; i < content_img.length; i++) {
                    insertContentResult = await connection.query(insertContentQuery, [episodeIdx, content_img[i].location]);
                }
            });

            if (!insertTransaction) {
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_EPISODE_FAILED));
            } else { //쿼리문이 성공했을 때
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_EPISODE_SUCCESS));
            }
        }

    }


});

module.exports = router;