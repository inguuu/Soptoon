var express = require('express');
var router = express.Router();
const upload = require('../../config/multer');
var moment = require('moment');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.get('/:webtoon_idx', async (req, res) => {

    const getEpisodesQuery =
        "SELECT * FROM episode WHERE webtoon_idx =?";
    const getEpisodesResult = await db.queryParam_Parse(getEpisodesQuery, [req.params.webtoon_idx]);

    if (!getEpisodesResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_EPISODE_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_EPISODE_SUCCESS, getEpisodesResult));
    }

});
router.post('/', upload.single('thumbnail_img'), async (req, res) => {

    const insertEpisodeQuery =
        'INSERT INTO episode (thumbnail_img, episode_title, webtoon_idx,createdAt) VALUES (?,?,?,?)';
    const insertEpisodeResult = await db.queryParam_Parse(insertEpisodeQuery,
        [req.file.location, req.body.episode_title, req.body.webtoon_idx, moment().format('YYYY-MM-DD HH:mm:ss')]);


    if (!insertEpisodeResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.INSERT_WEBTOON_FAILED));
    } else { //쿼리문이 성공했을 때

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INSERT_WEBTOON_SUCCESS));
    }

});



module.exports = router;