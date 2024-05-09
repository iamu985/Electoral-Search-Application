const express = require('express');
const router = express.Router();
// const path = require('path');

const enrollmentFormGetRoute = (req, res) => {
    console.log(`Method: Get | Route: enrollmentFormGetRoute`);
    res.render('enrollment', {title: 'Enrollment'});
}

const settingsGetRoute = (req, res) => {
    console.log(`Method: GET | Route: settingsGetRoute`);
    res.render('settings', {title: 'Settings'})
}

const indexGetRoute = (req, res) => {
    console.log(`Method: GET | Route: indexGetRoute`);
    res.render('index', {title: 'Index Page'});
}


router.get('/', indexGetRoute)
router.get('/enrollment', enrollmentFormGetRoute);
router.get('/settings', settingsGetRoute)

module.exports = router;