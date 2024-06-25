const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const { saveToDatabase, deepMerge, getNextSequenceValue, buildDbQuery, splitFullName } = require('../../utils/utilities');
const { createExcelFile } = require('../../utils/dev-utilities');

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

const viewEditHandler = async (req, res) => {
    console.log(`method: EDIT | handler: viewedithandler`);
    const formId = req.params.id;
    const data = await DataModel.findById(formId);
    return res.render('view-edit', { title: 'View Edit', data: data });
}

const searchGetHandler = async (req, res) => {
    console.log(`method: GET | handler: searchHandler`);
    const { field, value } = req.query;
    // console.log(`field: ${field} | value: ${value} from searchGetHandler`);

    if (!field || !value) {
        return res.status(400).json({ message: 'Missing field or value for search' });
    }

    try {
        const query = {};
        query[field] = value;
        // console.log(query);
        const results = await DataModel.find(query, 'id external_form_id firstname middlename lastname'); // Adjust the fields as needed
        // console.log('Returning from inside the handler: ', results);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

const searchViewGetHandler = async (req, res) => {
    console.log(`method: GET | handler: searchViewGetHandler`);
    const alldata = await DataModel.find();
    if (alldata) {
        res.render('search', { title: 'Search Page', data: alldata });
    } else {
        res.render('search', { title: 'Search Page' })
    }
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
    console.log(`method: GET | handler: enrollmentgethandler`);
    let options = { success: true };

    let associations = await SettingsModel.find({ entity_type: 'association' });
    let districts = await SettingsModel.find({ entity_type: 'districts' });
    let blocks = await SettingsModel.find({ entity_type: 'block' });
    let municipalities = await SettingsModel.find({ entity_type: 'municipality' });
    let gps = await SettingsModel.find({ entity_type: 'gp' });

    options.associations = associations;
    options.districts = districts;
    options.blocks = blocks;
    options.municipalities = municipalities
    options.gps = gps;
    // console.log(JSON.stringify(options, null, 2));

    res.render('enrollment', { title: 'Enrollment Form', options: options });
    
};


const enrollmentPostHandler = async (req, res) => {
    console.log(`method: POST | handler: enrollmentposthandler`);
    let testData = req.body;
    // console.log(testData);

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


const information1GetHandler = async (req, res) => {
    console.log(`method: GET | handler: information1handler`);
    let designations = await SettingsModel.find({ entity_type: 'designation' });
    let associations = await SettingsModel.find({ entity_type: 'association' });
    let districts = await SettingsModel.find({ entity_type: 'districts' });
    let blocks = await SettingsModel.find({ entity_type: 'block' });
    let municipalities = await SettingsModel.find({ entity_type: 'municipality' });
    let gps = await SettingsModel.find({ entity_type: 'gp' });


    options = {
        designations: designations,
        status: "success",
        associations: associations,
        districts: districts,
        blocks: blocks,
        municipalities: municipalities,
        gps: gps
    }

    if (req.query.edit) {
        console.log(`Information 1 form is in edit mode`);
        
        let formId = req.query.id;
        console.log(`Received FormId: ${formId}`);
    }

    if (req.session.data) {
        res.render('information-1', { title: 'Detailed Information I', data: req.session.data, options: options });
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
    // console.log(mergedData);
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
    // console.log(mergedData);
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
    // console.log(JSON.stringify(mergedData));

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


router.get('/view/edit/:id', viewEditHandler);
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
        let parsedNameData;
        for (const row of worksheet) {
            try {
                parsedNameData = splitFullName(row['Full Name']);
            } catch (err) {
                console.error(err);
                res.status(400).json({ success: false, error: err })
            }
            var data = {
                firstname: parsedNameData.firstname,
                middlename: parsedNameData.middlename,
                lastname: parsedNameData.lastname,
                mobile_number: row['Mobile Number'],
                status_of_employment: row['Status of Employment'],
                association_name: row['Association Name'],
                job_details: {
                    nature_of_job: row['Nature of Job'],
                },
                addresses: {
                    landmark: row['Landmark']
                }
            };

            if (data.middlename !== '') {
                data.fullname = data.firstname + ' ' + data.middlename + ' ' + data.lastname;
            } else {
                data.fullname = data.firstname + ' ' + data.lastname;
            }

            const nextId = await getNextSequenceValue('enrollmentId');

            // Generate the id based on the district, counterId and associationName
            const associationName = data.association_name;
            const generateId = `${nextId}-${associationName}`;

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