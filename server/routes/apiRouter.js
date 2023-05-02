const express = require('express');

const apiController = require('../controllers/apiController.js');

const router = express.Router();

router.post('/', apiController.postCommand, (req, res) => {
  return res.status(200).json(res.locals.cliResponse);
});

router.get('/key', apiController.getApi,(req,res) => {
  console.log('back in getApi controller')
  return res.status(200).json(res.locals.key);
});

router.post('/uid', apiController.getUid, (req, res) => {
  console.log('back in router apiController.getUid')
  return res.status(200).json(res.locals.uid);
})
module.exports = router;
