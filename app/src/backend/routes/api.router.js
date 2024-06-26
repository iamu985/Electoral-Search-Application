const express = require('express');
const apiRouter = express.Router();
const { buildQueryCondition, generateExcel } = require('../../utils/utilities');
const DataModel = require('../../models/Schema');
const SettingsModel = require('../../models/Settings');


const apiIndex = (req, res) => {
  console.log('API INDex');
  res.json({ 'message': 'hello from api' });
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
      "number_of_electors": "number_of_electors",
      "block": "address.block",
      "municipality": "address.municipality",
      "village": "address.village",
      "district": "address.district",
      "institution_name": "family_information.family_members.institution_information.name_of_institution",
      "state_of_institution": "family_information.family_members.institution_information.state_of_institution",
      "club_name": "family_information.family_members.institution_information.club",
      "dob": "dob",
      "beneficiary_scheme": "family_information.beneficiary_scheme",
      "external_form_id": "external_form_id"
    };

    const { queryData } = req.query;
    const parsedQueryData = JSON.parse(queryData);
    // console.log(`ParsedQuery: ${JSON.stringify(parsedQueryData, null, 2)}`);

    const queryConditions = [];
    let currentConditionGroup = [];

    parsedQueryData.forEach((query, index) => {
      // console.log(JSON.stringify(query));
      const condition = buildQueryCondition(searchFieldMapping[query.field], query.option, query.value);
      currentConditionGroup.push(condition);

      // Check if the next logical operator is AND or OR, and handle accordingly
      if (index < parsedQueryData.length - 1) {
        const nextLogicalOperator = parsedQueryData[index + 1].logicalOperator;
        if (nextLogicalOperator === 'or') {
          queryConditions.push({ $and: currentConditionGroup });
          currentConditionGroup = [];
        }
      } else {
        queryConditions.push({ $and: currentConditionGroup });
      }
    });

    // Combine all query conditions with $or
    const finalQuery = queryConditions.length > 1 ? { $or: queryConditions } : queryConditions[0];
    // console.log(`FinalQuery: ${JSON.stringify(finalQuery)}`);

    try {
      const results = await DataModel.find(finalQuery);
      res.json({ success: true, results });
    } catch (err) {
      res.status(500).json({ success: false, message: 'An error occurred while processing your request.', error: err });
    }

  } catch (err) {
    console.error(`Error Received: ${err}`);
    res.json({ success: false, error: err });
  }
}

const isUniqueMobileNumberAPIHandler = async (req, res) => {
  console.log(`Method: GET | handler: isUniquePhoneNumberHandler`);
  try {
    const query = { mobile_number: req.params.mobileNumber };
    // console.log(query);
    const results = await DataModel.find(query);
    // console.log(results);

    if (results.length === 0) {
      res.json({ success: true, isUnique: true });
    } else {
      res.json({ success: true, isUnique: false });
    }
  } catch (error) {
    console.error('Error checking phone number uniqueness:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Settings API Handlers
const settingsSearchAPIRequestHandler = async (req, res) => {
  console.log(`method: GET | handler: apisettingssearchhandler`)
  try {
    let entityType = req.query.entity_type;
    let query = {};
    let value = req.query.value;

    if (value !== null) {
      query = { entity_type: entityType, value: { $regex: value, $options: "i" } };
    } else {
      query = { entity_type: entityType };
    }

    // console.log(`Query: ${JSON.stringify(query)}`);
    const results = await SettingsModel.find(query);
    // console.log(`Results: ${JSON.stringify(results)}`);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching values', error: error.message });
  }
}

const settingsAPIGetAllValues = async (req, res) => {
  try {
    let entityType = req.body.entity_type;
    let query = { entity_type: entityType };

    const results = await SettingsModel.find(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching all values' });
  }
}

const settingsPostAPIRequestHandler = async (req, res) => {
  try {
    const { entityType, value } = req.body;
    const postData = {
      entity_type: entityType,
      value: value
    }
    const newSetting = new SettingsModel(postData);
    await newSetting.save();

    // get all entity values
    const query = { entity_type: entityType };
    const results = await SettingsModel.find(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding value', error: error.message });
  }
}

const settingsEditAPIRequestHandler = async (req, res) => {
  console.log('Method: PATCH | handler: apisettingsedithandler')
  try {
    const id = req.params.id;
    const value = req.body;
    // console.log(`ValueReceived: ${value}`);
    await SettingsModel.findByIdAndUpdate(id, value);
    res.json({ success: true, return: { id: id, value: value } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating value', error: error.message });
  }
}

const settingsDeleteAPIRequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await SettingsModel.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting value', error: error.message });
  }
}

const getFormDataByIdAPIHandler = async (req, res) => {
  console.log(`method: GET | handler: apigetfromdatabyid`);
  try {
    let formId = req.params.id;
    console.log(`ReceivedFormID: ${formId}`);
    const returnData = await DataModel.findById(formId);
    res.status(200).json({ data: returnData });
  } catch (err) {
    res.status(400).json({ data: { detail: err } });
  }
}

const updateDataByIdAPIHandler = async (req, res) => {
  console.log(`method: POST | handler: updatedatabyidapihandler`);
  const formId = req.params.id;
  const updateData = req.body;
  try {
    const response = await DataModel.findByIdAndUpdate(formId, updateData);
    if (response) {
      res.status(200).json({ success: true, data: response });
    } else {
      res.status(400).json({ success: false, detail: { message: 'Could not find the data', formId: formId, requestData: updateData } });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, details: err });
  }
}

const getAllDataAPIHandler = async (req, res) => {
  console.log(`method: GET | handler: getalldataapihandler`);
  try {
    const data = await DataModel.find();
    if (data) {
      res.status(200).json({ success: true, data: data });
    } else {
      res.status(400).json({ success: false, error: 'No data found' });
    }
  } catch (err) {
    res.status(400).json({ success: false, details: err });
  }
}
const settingsImportAPIHandler = async (req, res) => {
  console.log(`method: POST | handler: settingsImportAPIHandler`);
  try {
    const data = req.body.data;
    let bulkOps = [];

    data.forEach(item => {
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const entityType = key.toLowerCase();
          const value = item[key];
          bulkOps.push({
            updateOne: {
              filter: { entity_type: entityType, value },
              update: { entity_type: entityType, value },
              upsert: true
            }
          });
        }
      }
    });

    // Assuming you have a Mongoose model called 'Setting'
    await SettingsModel.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


apiRouter.post('/download-excel', (req, res) => {
  console.log('method: POST | handler: downloadexcel');
  const data = req.body;

  try {
    const filePath = generateExcel(data);
    console.log(`File generated at: ${filePath}`);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error while sending the file:', err);
        res.status(500).send('Error while downloading the file');
      } else {
        // Remove the file after download
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});

apiRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await DataModel.findByIdAndDelete(id);
    const results = await DataModel.find(); // Fetch updated results
    res.json({ success: true, results });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

apiRouter.delete('/deleteAll', async (req, res) => {
  try {
    await DataModel.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

apiRouter.post('/settings/import', settingsImportAPIHandler);
// API Routes
apiRouter.get('/', apiIndex);
apiRouter.get('/search', searchAPIRequestHandler);
apiRouter.get('/isUniqueMobileNumber/:mobileNumber', isUniqueMobileNumberAPIHandler);

apiRouter.post('/settings/add', settingsPostAPIRequestHandler);
apiRouter.get('/settings/search', settingsSearchAPIRequestHandler);
apiRouter.patch('/settings/edit/:id', settingsEditAPIRequestHandler);
apiRouter.delete('/settings/delete/:id', settingsDeleteAPIRequestHandler);
apiRouter.get('/settings/getall', settingsAPIGetAllValues);
apiRouter.get('/getDataById/:id', getFormDataByIdAPIHandler);
apiRouter.post('/updateDataById/:id', updateDataByIdAPIHandler);
apiRouter.get('/getAllData', getAllDataAPIHandler);

module.exports = apiRouter;
