const express = require('express');
const router = express.Router();
// const path = require('path');

const enrollmentFormGetRoute = (req, res) => {
    console.log(`Method: Get | Route: enrollmentFormGetRoute`);
    res.render('enrollment');
}

router.get('/', enrollmentFormGetRoute);

module.exports = router;