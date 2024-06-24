const path = require('path');

const TestModel = require('../../src/models/TestSchema');
const DataModel = require('../../src/models/Schema');
const Counter = require('../../src/models/Counter');
const XLSX = require('xlsx');


const filepath = path.join(__dirname, '../.cache/blob.json');


// This function temporary saves the form data in blob.json
// This is to avoid committing to the database without completing
// all the steps
function saveData(data) {
    console.log(`Initiating saving json data.`)
    console.log(`Saving in ${filepath}`);

    let jsonString = JSON.stringify(data, null, 2);

    fs.writeFile(filepath, jsonString, 'utf-8', (err) => {
        if (err) {
            console.log(`Could not write to the file. Error: ${err}`)
        } else {
            console.log('Wrote to the file.');
        }
    })
}

async function readData() {
    console.log('Initiating reading json data.');

    try {
        let data = await fs.readFile(filepath);
        if (data.toString() === '') {
            console.log('Data is empty.');
            return null;
        } else {
            let parsedData = JSON.parse(data);
            console.log('Fetched Data');
            return parsedData;
        }
    } catch (err) {
        console.error(`Error during reading: ${err}`);
        return null;
    }
}

async function saveToDatabase(jsondata, debug = true) {
    console.warn('Initiating saving to database. Make sure the data is cleaned and validated.');
    let Model, modelInstance;
    if (debug) {
        Model = TestModel;
    } else {
        Model = DataModel;
    }

    modelInstance = new Model(jsondata);
    try {
        await modelInstance.save();
        console.log('Saved to database.');
        return { saved: true };
    } catch (err) {
        console.log(`Error: ${err}`);
        return { saved: false, error: err };
    }
}

function deepMerge(target, source) {
    for (var key in target) {
        source[key] = target[key];
    }
    return source;
}

const getNextSequenceValue = async (sequenceName) => {
    const counter = await Counter.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence_value;
};


const buildQueryCondition = (field, option, value) => {
    console.log(`BuildQueryCondition Invoked:\nField:${field}, Option: ${option}, Value: ${value}`);
    switch (option) {
        case 'ct':
            return { [field]: { $regex: value, $options: 'i' } };
        case 'iec':
            return { [field]: value };
        case 'ies':
            return { [field]: { $regex: `${value}$`, $options: 'i' } };
        case 'sw':
            return { [field]: { $regex: `^${value}`, $options: 'i' } };
        case 'gt':
            return { [field]: { $gt: value } };
        case 'gte':
            return { [field]: { $gte: value } };
        case 'lt':
            return { [field]: { $lt: value } };
        case 'lte':
            return { [field]: { $lte: value } };
        case 'ne':
            return { [field]: { $ne: value } };
        default:
            return {};
    }
};


const splitFullName = (fullname) => {
    const parts = fullname.split(' ');
    switch (parts.length) {
        case 1:
            return { firstname: parts[0], middlename: '', lastname: '' };
            break;
        case 2:
            return { firstname: parts[0], middlename: '', lastname: parts[1] };
            break;
        case 3:
            return { firstname: parts[0], middlename: parts[1], lastname: parts[2] };
            break;
        default:
            console.error(`Received more than three parts as fullname for ${fullname}`);
            throw 'Cannot parse fullname';
    }
}

const generateExcel = (data) => {
    try {
      console.log(`Inside generateExcel\n | ReceivedData: ${JSON.stringify(data, null, 2)}`)
      const workbook = XLSX.utils.book_new();
  
      // Create Primary Details sheet
      const primaryDetails = [
        ['Field', 'Value'],
        ['ID', data._id],
        ['Full Name', data.fullname ?? ''],
        ['Nick Name', data.nickname ?? ''],
        ['Date of Birth', data.dob ?? ''],
        ['Caste', data.caste ?? ''],
        ['Religion', data.religion ?? '']
      ];
  
      const primaryDetailsSheet = XLSX.utils.aoa_to_sheet(primaryDetails);
      XLSX.utils.book_append_sheet(workbook, primaryDetailsSheet, 'Primary Details');
  
      // Create Residential Address sheet
      const residentialAddress = [
        ['Field', 'Value'],
        ['District', data.addresses.district ?? ''],
        ['Municipality', data.addresses.municipality ?? ''],
        ['Block', data.addresses.block ?? ''],
        ['Gram Panchayat', data.addresses.gp ?? ''],
        ['Village/Para/Ward Number', data.addresses.village ?? ''],
        ['Landmark', data.addresses.landmark ?? ''],
        ['Remarks', data.addresses.remarks ?? '']
      ];
  
      const residentialAddressSheet = XLSX.utils.aoa_to_sheet(residentialAddress);
      XLSX.utils.book_append_sheet(workbook, residentialAddressSheet, 'Residential Address');
  
      // Create Job Details sheet
      const jobDetails = [
        ['Field', 'Value'],
        ['Designation', data.job_details.designation ?? ''],
        ['Date of Joining', data.job_details.date_of_joining ?? ''],
        ['Nature of Job', data.job_details.nature_of_job ?? ''],
        ['Employment Organization Name', data.job_details.employment_organization_name ?? ''],
        ['Status of Employment', data.status_of_employment ?? '']
      ];
  
      const jobDetailsSheet = XLSX.utils.aoa_to_sheet(jobDetails);
      XLSX.utils.book_append_sheet(workbook, jobDetailsSheet, 'Job Details');
      console.log('Done jobdetails');
  
      // Create Additional Details sheet
     try {
        const additionalDetails = [
            ['Field', 'Value'],
            ['Contact Leader Name', data.additional_details.contact_leader_name ?? ''],
            ['During service, did you take membership of any other opposition?', data.additional_details.had_taken_opposition_membership ?? ''],
            ['Did Trade Union Rights exist at the time of your service?', data.additional_details.trade_union_right_on ?? ''],
            ['Did you play any leadership role during your service?', data.additional_details.has_played_leadership_role ?? ''],
            ['If yes, at which stage?', data.additional_details.played_leadership_role_stage ?? '']
          ];
      
          const additionalDetailsSheet = XLSX.utils.aoa_to_sheet(additionalDetails);
          XLSX.utils.book_append_sheet(workbook, additionalDetailsSheet, 'Additional Details');
    
          console.log('Done additionaldetails');
     } catch (err) {
        // res.json({success: false, error: 'additional details is empty'})
        console.warn('additional details is empty');
     }
      
  
      // Create Family Information sheet
      const familyInformation = [
        ['Field', 'Value'],
        ['Family Type', data.family_information.family_type ?? ''],
        ['Number of Family Members', data.family_information.number_of_family_members ?? ''],
        ['Number of Electors', data.family_information.number_of_electors ?? '']
      ];
  
      const familyMembers = data.family_information.family_members.map(member => [
        member.firstname ?? '',
        member.middlename ?? '',
        member.lastname ?? '',
        member.relationship ?? '',
        member.is_student ?? '',
        member.is_new_elector ?? '',
        member.age ?? '',
        member.institution_information?.name_of_institution ?? '',
        member.institution_information?.state_of_institution ?? '',
        member.institution_information?.club ?? '',
        member.associated_association?.name_of_organization ?? '',
        member.associated_association?.phone ?? '',
        member.associated_association?.in_leadership_role ?? ''
      ]);
  
      const familyMembersHeader = [
        'First Name',
        'Middle Name',
        'Last Name',
        'Relationship',
        'Is Student',
        'Is New Elector',
        'Age',
        'Institution Name',
        'State of Institution',
        'Club',
        'Association Name',
        'Phone',
        'Leadership Role'
      ];
  
      const familyInformationSheet = XLSX.utils.aoa_to_sheet([familyMembersHeader, ...familyMembers]);
      XLSX.utils.book_append_sheet(workbook, familyInformationSheet, 'Family Information');

      console.log('Done famillyinformation');
  
      // Create Beneficiary Schemes sheet
      const beneficiarySchemes = data.family_information.beneficiary_scheme.map(scheme => [scheme ?? '']);
      const beneficiarySchemesSheet = XLSX.utils.aoa_to_sheet([['Name'], ...beneficiarySchemes]);
      XLSX.utils.book_append_sheet(workbook, beneficiarySchemesSheet, 'Beneficiary Schemes');
  
      // Create Evaluation sheet
      const rolePlay = [
        ['Field', 'Value'],
        ['Organization', data.evaluation.role_play.organization ?? ''],
        ['Working Area', data.evaluation.role_play.working_area ?? ''],
        ['Concern Association', data.evaluation.role_play.concern_association ?? ''],
        ['Regular Manner', data.evaluation.role_play.regular_manner ?? '']
      ];
  
      const questions = data.evaluation.questions.map(question => [question.question ?? '', question.answer ?? '']);
      const questionsSheet = XLSX.utils.aoa_to_sheet([['Question', 'Answer'], ...questions]);
  
      XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions');
  
      const filePath = path.join(__dirname, 'view-details.xlsx');
      XLSX.writeFile(workbook, filePath);

      console.log('Done roleplay');
  
      return filePath;
    } catch (error) {
      console.error('Error in generateExcel function:', error);
      throw error;
    }
  };
  




module.exports = { saveData, readData, saveToDatabase, deepMerge, getNextSequenceValue, buildQueryCondition, splitFullName, generateExcel }