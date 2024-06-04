const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const { saveToDatabase, deepMerge, getNextSequenceValue, buildDbQuery } = require('../../utils/utilities');
const { generateDummyData, createExcelFile } = require('../../utils/dev-utilities');

const ConfigPath = path.join(__dirname, '../../../config/conf.json'); // config directory

const Config = JSON.parse(fs.readFileSync(ConfigPath, 'utf8')); // config file
// console.log(Config['configs']["evaluation"])


// const TestModel = require('../../models/TestSchema');
const DataModel = require('../../models/Schema');
const SettingsModel = require('../../models/Settings');
const uploadFile = require('../handlers');
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


const sessionDataGetHandler = (req, res) => {
    console.log(`method: GET | handler: sessionDataHandler`);
    const sessionData = req.session.data;
    console.log(sessionData);
    res.json(sessionData);
};

const settingsGetHandler = async (req, res) => {
    console.log(`method: GET | handler: settingsedit`);
    // Fetch all settings values
    const settingsData = await SettingsModel.find();
    console.log(`SettingsData: ${JSON.stringify(settingsData)}`);
    res.render('settings', { title: 'Settings Configure', data: settingsData });
}


const enrollmentGetHandler = async (req, res) => {
    console.log(`method: GET | handler: enrollmenthandler`);
    let options = { title: 'Enrollment Form', success: true, edit: false };
    
    if (req.query.edit) {
        console.log(`Form is in edit mode`);
        let formId = req.query.id;
        console.log(`Received FormId: ${formId}`);
        let data = await DataModel.findById(formId);
        console.log(`RetrievedData: ${JSON.stringify(data)}`);
        if (!data) {
            console.log(`Data not found`);
            res.json({ message: 'Data not found' });
        } else {
            options.edit = true;
            options.data = data;
            res.render('enrollment', options);
        }
    } else {
        res.render('enrollment', options);
    }
};




const enrollmentPostHandler = async (req, res) => {
    console.log(`method: POST | handler: enrollmenthandler`);
    let testData = req.body;
    console.log(testData);

    // Get Next Id
    const nextId = await getNextSequenceValue('enrollmentId');

    // Generate the id based on the district, counterId and associationName
    const district = testData.addresses.district;
    const associationName = testData.association_name;
    const generateId = `${nextId}-${district}-${associationName}`;

    testData.id = generateId;

    console.log('Saving it in session.');
    req.session.data = testData;
    res.json({ success: true, redirect: '/information1' });
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

const evaluationGetHandler = async (req, res) => {
    console.log(`method: GET | handler: evaluationhandler`);
    let evaluationConfigObject = Config['configs']["evaluation"];
    res.render('evaluation', { title: 'Evaluation Form', options: evaluationConfigObject });
}

const evaluationPostHandler = async (req, res) => {
    console.log(`method: POST | handler: evaluationhandler`);
    let postData = req.body;
    let sessionData = req.session.data;
    let mergedData = deepMerge(sessionData, postData);
    console.log(JSON.stringify(mergedData));

    var verdict = await saveToDatabase(mergedData, debug = false);
    if (verdict.saved) {
        res.json({ success: true, title: 'Success', redirect: '/success' });
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
        const formData = await DataModel.findOne({ _id: req.params.id });
        if (!formData) {
            return res.status(404).render('404', { message: 'Form not found' });
        }
        res.render('view', { title: "View", data: formData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/generate-dummy', (req, res) => {
    // dummy data generator
    try {
        const dummyData = generateDummyData();
        createExcelFile(dummyData, 'dummy_data.xlsx');
        console.log('Excel file with dummy data created successfully.');
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err });
    }

})

router.get('/import', (req, res) => {
    res.render('import', { title: 'Import Data' });
})

router.post('/import', uploadFile.single('excelFile'), async (req, res) => {
    console.log('Inside Import');
    try {
        const filePath = req.file.path;
        console.log(`FilePath: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Use a loop instead of map to handle async/await
        const parsedData = [];
        for (const row of worksheet) {
            var data = {
                firstname: row['First Name'],
                middlename: row['Middle Name'],
                lastname: row['Last Name'],
                mobile_number: row['Mobile Number'],
                dob: new Date(row['Date of Birth']),
                caste: row['Caste'],
                religion: row['Religion'],
                status_of_employment: row['Status of Employment'],
                number_of_family_members: row['Number of Family Members'],
                number_of_electors: row['Number of Electors'],
                number_of_new_electors: row['Number of New Electors'],
                association_name: row['Association Name'],
                job_details: {
                    designation: row['Designation'],
                    date_of_joining: new Date(row['Date of Joining']),
                    nature_of_job: row['Nature of Job'],
                    employment_organization_name: row['Employment Organization Name']
                },
                family_information: {
                    family_type: row['Family Type'],
                    family_members: JSON.parse(row['Family Members']) // Assuming Family Members is a JSON string
                },
                evaluation: {
                    role_play: {
                        organization: row['Role Play Organization'],
                        working_area: row['Working Area'],
                        concern_association: row['Concern Association'],
                        regular_manner: row['Regular Manner']
                    },
                    questions: JSON.parse(row['Questions']) // Assuming Questions is a JSON string
                }
            };

            if (data.middlename !== '') {
                data.fullname = data.firstname + ' ' + data.middlename + ' ' + data.lastname;
            } else {
                data.fullname = data.firstname + ' ' + data.lastname;
            }

            const nextId = await getNextSequenceValue('enrollmentId');

            // Generate the id based on the district, counterId and associationName
            const district = data.family_information.family_members[0].district;
            const associationName = data.association_name;
            const generateId = `${nextId}-${district}-${associationName}`;

            data.id = generateId;

            parsedData.push(data);
        }

        const savedData = await DataModel.insertMany(parsedData);

        fs.unlinkSync(filePath); // Remove the uploaded file

        res.json({ success: true, id: savedData.map(data => data._id) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error importing data', error: error.message });
    }
});




router.get('/', indexGetHandler)
router.get('/success', successGetHandler);
// router.get('/search', searchGetHandler);
router.get('/search', searchViewGetHandler);

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