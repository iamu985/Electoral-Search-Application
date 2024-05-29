const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { saveToDatabase, deepMerge, getNextSequenceValue, buildDbQuery } = require('../../utils/utilities');

const ConfigPath = path.join(__dirname, '../../../config/conf.json'); // config directory

const Config = JSON.parse(fs.readFileSync(ConfigPath, 'utf8')); // config file
console.log(Config['configs']["evaluation"])


// const TestModel = require('../../models/TestSchema');
const DataModel = require('../../models/Schema');
// const { error } = require('console');


// Handlers

const indexGetHandler = (req, res) => {
    console.log(`method: GET | handler: indexhandler`);
    res.render('index', { title: 'Index Page' });
}

const searchGetHandler = async (req, res) => {
    console.log(`method: GET | handler: searchHandler`);
    const { field, value } = req.query;
    console.log(`field: ${field} | value: ${value} from searchGetHandler`);

    if (!field || !value) {
        return res.status(400).json({ message: 'Missing field or value for search' });
    }

    try {
        const query = {};
        query[field] = value;
        console.log(query);
        const results = await DataModel.find(query, 'id firstname middlename lastname'); // Adjust the fields as needed
        console.log('Returning from inside the handler: ', results);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

const searchViewGetHandler = (req, res) => {
    console.log(`method: GET | handler: searchViewGetHandler`);
    res.render('search', { title: 'Search Page' });
}

const searchAPIRequestHandler = async (req, res) => {
    console.log(`Method: GET | handler: searchAPIRequestHandler`);
  try {
    const searchFieldMapping = {
        "firstname": "firstname",
        "middlename": "middlename",
        "lastname": "lastname",
        "age": "family_information.family_members.age",
        "id": "id",
        "designation": "job_details.designation",
        "status_of_employment": "status_of_employment",
        "employment_organization_name": "job_details.employment_organization_name",
        "association_name": "association_name",
        "religion": "religion",
        "caste": "caste",
        "mobile_number": "mobile_number",
        "number_of_family_members": "number_of_family_members",
        "number_of_new_electors": "number_of_new_electors",
        "number_of_electos": "number_of_electos",
        "block": "address.block",
        "municipality": "address.municipality",
        "village": "address.village",
        "district": "address.district",
        "institution_name": "family_information.family_members.institution_information.name_of_institution",
        "state_of_institution": "family_information.family_members.institution_information.state_of_institution",
        "club_name": "family_information.family_members.institution_information.club"
    }
    const dbQuery = buildDbQuery(requestQuery=req.query, fieldMapping=searchFieldMapping);
    console.log(`Received Query: ${JSON.stringify(req.query, null, 2)}`);
    console.log(`BuildQuery: ${JSON.stringify(dbQuery, null, 2)}`);

    // Execute the query
    const results = await DataModel.find(dbQuery);
    // console.log(JSON.stringify(results, null, 2));
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

const sessionDataGetHandler = (req, res) => {
    console.log(`method: GET | handler: sessionDataHandler`);
    res.json(req.session.data);
};

const settingsGetHandler = (req, res) => {
    console.log(`method: GET | handler: settingshandler`);
    res.render('settings', { title: 'Settings Page' });
}


const enrollmentGetHandler = (req, res) => {
    console.log(`method: GET | handler: enrollmenthandler`);
    res.render('enrollment', { title: 'Enrollment Form', status: "success" });
}

const enrollmentPostHandler = async (req, res) => {
    console.log(`method: POST | handler: enrollmenthandler`);
    let testData = req.body;
    console.log(testData);

    // Get Next Id
    const nextId = await getNextSequenceValue('enrollmentId');

    // Generate the id based on the district, counterId and associationName
    const district = testData.addresses[0].district;
    const associationName = testData.association_name;
    const generateId = `${nextId}-${district}-${associationName}`;

    testData.id = generateId;
    
    console.log('Saving it in session.');
    req.session.data = testData;
    res.json({success: true, redirect: '/information1'});
};


const information1GetHandler = (req, res) => {
    console.log(`method: GET | handler: information1handler`);
    let designations = Config.configs.designations;
    if (req.session.data) {
        res.render('information-1', { title: 'Detailed Information I', data: req.session.data, designations: designations, status: "success" })
    } else {
        res.redirect('/enrollment');
    }
}

const information1PostHandler = (req, res) => {
    console.log(`method: POST | handler: information1handler`)
    let postData = req.body;
    let sessionData = req.session.data;
    let mergedData = deepMerge(sessionData, postData);
    req.session.data = mergedData;
    console.log(mergedData);
    res.json({ success: true, redirect: '/information2' });
}

const information2GetHandler = (req, res) => {
    console.log(`method: GET | handler: information2handler`);
    let districtsObject = Config['configs']["districts"];
    res.render('information-2', { title: 'Family Information', districts: districtsObject });
}

const information2PostHandler = (req, res) => {
    console.log(`method: POST | handler: information2handler`);
    let postData = req.body;
    let sessionData = req.session.data;
    let mergedData = deepMerge(sessionData, postData);
    req.session.data = mergedData;
    console.log(mergedData);
    res.json({ success: true, redirect: '/evaluation' })
}

const evaluationGetHandler = (req, res) => {
    console.log(`method: GET | handler: evaluationhandler`);

    let evaluationConfigObject = Config['configs']["evaluation"];
    res.render('evaluation', { title: 'Evaluation Form', options: evaluationConfigObject });
}

const evaluationPostHandler = async (req, res) => {
    console.log(`method: POST | handler: evaluationhandler`);
    let postData = req.body;
    let sessionData = req.session.data;
    let mergedData = deepMerge(sessionData, postData);
    console.log(mergedData);

    var verdict = await saveToDatabase(mergedData, debug=false);
    if (verdict.saved) {
        res.json({success:true, title: 'Success', redirect: '/success'});
    } else {
        res.render('/evaluation', { title: "Evaluation Form" });
    }
}

const successGetHandler = (req, res) => {
    console.log(`method: GET | handler: successhandler`);
    res.render('success', { title: 'Success' });
}

router.get('/view/:id', async (req, res) => {
    try {
        const formData = await DataModel.findOne({ id: req.params.id });
        if (!formData) {
            return res.status(404).render('404', { message: 'Form not found' });
        }
        res.render('view', { title: "View", data: formData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/isUniqueMobileNumber/:mobileNumber', async (req, res) => {
    console.log(`method: GET | handler: isUniquePhoneNumberHandler`);
    // console.log(`phoneNumber: ${mobileNumber} from isUniquePhoneNumberHandler`);

    try {
        const query = { mobile_number: req.params.mobileNumber };
        console.log(query); 
        const results = await DataModel.find(query);
        console.log(results);

        if (results.length === 0) {
            res.json({ success: true, isUnique: true });
        } else {
            res.json({ success: true, isUnique: false });
        }
    } catch (error) {
        console.error('Error checking phone number uniqueness:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.get('/', indexGetHandler)
router.get('/success', successGetHandler);
router.get('/search', searchGetHandler);
router.get('/search1', searchViewGetHandler);
router.get('/api/search', searchAPIRequestHandler);
router.get('/session-data', sessionDataGetHandler)
router.get('/settings', settingsGetHandler)


router.route('/enrollment')
    .get(enrollmentGetHandler)
    .post(enrollmentPostHandler)


router.route('/information1')
    .get(information1GetHandler)
    .post(information1PostHandler)


router.route('/information2')
    .get(information2GetHandler)
    .post(information2PostHandler)


router.route('/evaluation')
    .get(evaluationGetHandler)
    .post(evaluationPostHandler)
    

module.exports = router;