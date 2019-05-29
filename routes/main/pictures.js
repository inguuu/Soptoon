var express = require('express');
var router = express.Router();


const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

router.get('/', async (req, res) => {

    const getAllPicturesQuery = "SELECT * FROM pictures";
    const getAllPicturesResult = await db.queryParam_None(getAllPicturesQuery);

    if (!getAllPicturesResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SELECT_PICTURES_FAILED));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SELECT_PICTURES_SUCCESS, getAllPicturesResult));
    }

});



module.exports = router;
