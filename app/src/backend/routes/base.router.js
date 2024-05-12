const express = require('express');
const router = express.Router();
const { saveData, readData, saveToDatabase } = require('../../utils/utilities');
// const path = require('path');

const TestModel = require('../../models/TestSchema');


// Handlers

const indexGetHandler = (req, res) => {
    console.log(`method: GET | handler: indexhandler`);
    res.render('index', { title: 'Index Page' });
}

const enrollmentGetHandler = (req, res) => {
    console.log(`method: GET | handler: enrollmenthandler`);
    res.render('enrollment', { title: 'Enrollment Form' });
}

const enrollmentPostHandler = (req, res) => {
    console.log(`method: POST | handler: enrollmenthandler`);
    let data = req.body;

    //  creating an object from the data
    // let formData = {
    //     'firstname': data.firstName,
    //     'middlename': data.middleName,
    //     'lastname': data.lastName,
    //     'mobile_number': data.phoneNumber,
    //     'status_of_employment': data.statusOfEmployment,
    //     'number_of_family_member': data.numberOfFamily,
    //     'number_of_electors': data.numberOfElectors,
    //     'number_of_new_electors': data.numberOfNewElectors,
    //     'association_name': data.associationName,
    //     'district': data.district,
    //     'municipality': data.municipality,
    //     'block': data.block,
    //     'gp': data.gp,
    //     'village': data.village,
    //     'landmark': data.landmark,
    //     'remarks': data.remarks
    // }

    let testData = {
        'first_name': data.firstName,
        'middle_name': data.middleName,
        'last_name': data.lastName,
        'mobile_number': data.phoneNumber,
        'status_of_employment': data.statusOfEmployment,
        'number_of_family_members': data.numberOfFamily,
        'number_of_electors': data.numberOfElectors,
        'number_of_new_electors': data.numberOfNewElectors,
        'association_name': data.associationName,
        'addresses': [
            {
                'district': data.district,
                'municipality': data.municipality,
                'block': data.block,
                'gp': data.gp,
                'village': data.village,
                'landmark': data.landmark,
                'remarks': data.remarks
            }
        ]
    }

    console.log('Trying to save to testmodel');
    saveToDatabase(testData);

    // console.log(formData);

    // // check if there's already data in the blob
    // let blobData = readData();
    // if (blobData === null) {
    //     saveData(formData);
    // } else {
    //     for (let key in formData) {
    //         if (blobData.hasOwnProperty(key)) {
    //             blobData[key] = formData[key];
    //         } else {
    //             blobData[key] = formData[key];
    //         }
    //     }
    //     saveData(blobData);
    // }
    res.render('enrollment', { title: 'Enrollment Form' })
}

const settingsGetHandler = (req, res) => {
    console.log(`method: GET | handler: settingshandler`);
    res.render('settings', { title: 'Settings Page' });
}




router.get('/', indexGetHandler)
router.get('/settings', settingsGetHandler)

router.route('/enrollment')
    .get(enrollmentGetHandler)
    .post(enrollmentPostHandler)

module.exports = router;