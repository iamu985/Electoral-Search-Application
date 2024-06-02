const express = require('express');
const apiRouter = express.Router();
const { buildDbQuery } = require('../../utils/utilities');
const DataModel = require('../../models/Schema');
const SettingsModel = require('../../models/Settings');


const apiIndex = (req, res) => {
    console.log('API INDex');
    res.json({'message': 'hello from api'});
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
      "club_name": "family_information.family_members.institution_information.club"
    };
    
    const dbQuery = buildDbQuery(req.query, searchFieldMapping);
    console.log(`Received Query: ${JSON.stringify(req.query, null, 2)}`);
    console.log(`BuildQuery: ${JSON.stringify(dbQuery, null, 2)}`);
    
    const results = await DataModel.find(dbQuery);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

const isUniqueMobileNumberAPIHandler = async (req, res) => {
  console.log(`Method: GET | handler: isUniquePhoneNumberHandler`);
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
}

// Settings API Handlers
const settingsSearchAPIRequestHandler = async (req, res) => {
  console.log(`method: GET | handler: apisettingssearchhandler`)
  try {
    let entityType = req.query.entity_type;
    let query = { };
    let value = req.query.value;

    if (value !== null) {
      query = { entity_type: entityType, value: { $regex: value, $options: "i"} }; 
    } else {
      query = { entity_type: entityType };
    }

    console.log(`Query: ${JSON.stringify(query)}`);
    const results = await SettingsModel.find(query);
    console.log(`Results: ${JSON.stringify(results)}`);
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
  } catch(error) {
    res.status(500).json({ success: false, message: 'Error fetching all values'});
  }
}

const settingsPostAPIRequestHandler = async (req, res) => {
  try {
    const {entityType, value} = req.body;
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
    const value = req.body.value;
    await SettingsModel.findByIdAndUpdate(id, value);
    res.json({ success: true });
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

// API Routes
apiRouter.get('/', apiIndex);
apiRouter.get('/search', searchAPIRequestHandler);
apiRouter.get('/isUniqueMobileNumber/:mobileNumber', isUniqueMobileNumberAPIHandler);

apiRouter.post('/settings/add', settingsPostAPIRequestHandler);
apiRouter.get('/settings/search', settingsSearchAPIRequestHandler);
apiRouter.patch('/settings/edit/:id', settingsEditAPIRequestHandler);
apiRouter.delete('/settings/delete/:id', settingsDeleteAPIRequestHandler);
apiRouter.get('/settings/getall', settingsAPIGetAllValues);

module.exports = apiRouter;
