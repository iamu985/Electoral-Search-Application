const { json } = require('express');
const { read } = require('fs');
const fs = require('fs/promises');
const path = require('path');

const TestModel = require('../../src/models/TestSchema');
const DataModel = require('../../src/models/Schema');
const Counter = require('../../src/models/Counter');
const { Model } = require('mongoose');
const { request } = require('http');


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
            return { firstname: parts[0], middlename: '', lastname: parts[1]};
            break;
        case 3:
            return { firstname: parts[0], middlename: parts[1], lastname: parts[2]};
            break;
        default:
            console.error(`Received more than three parts as fullname for ${fullname}`);
            throw 'Cannot parse fullname';
    }
}




module.exports = { saveData, readData, saveToDatabase, deepMerge, getNextSequenceValue, buildQueryCondition, splitFullName }