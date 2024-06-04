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


const buildDbQuery = (requestQuery, fieldMapping) => {
    console.log(`buildDbQuery utility function invoked.`);
    let parsedRequest = JSON.parse(requestQuery);
    console.log('RequestQuery: ' + JSON.stringify(parsedRequest, null, 2));
    let query = {};

    parsedRequest.forEach(element => {
        const field = fieldMapping[element.search_field];
        const value = element.search_value;
        console.log(`SearchField: ${field} | SearchValue: ${value}`);

        if (!field || !value) {
            console.warn(`Skipping invalid search parameter: field=${field}, value=${value}`);
            return { success: false, errorMessage: `Skipping invalid search parameter: field=${field}, value=${value}`}; // Skip invalid entries
        }

        switch (element.search_option) {
            case 'ct':
                query[field] = { $regex: value, $options: "i" };
                break;
            case 'ies':
                query[field] = { $regex: new RegExp(`^${value}$`, "i") };
                break;
            case 'iec':
                query[field] = value;
                break;
            case 'sw':
                query[field] = { $regex: '^' + value, $options: "i" };
                break;
            case 'gt':
                query[field] = { $gt: value };
                break;
            case 'gte':
                query[field] = { $gte: value };
                break;
            case 'lt':
                query[field] = { $lt: value };
                break;
            case 'lte':
                query[field] = { $lte: value };
                break;
            default:
                console.warn(`Unknown search option: ${element.search_option}`);
                return { success: false, errorMessage: `Unknown search option: ${element.search_option}` }
        }
    });

    console.log(`Query built: ${JSON.stringify(query, null, 2)}`);
    return { success: true, query: query };
};




module.exports = { saveData, readData, saveToDatabase, deepMerge, getNextSequenceValue, buildDbQuery }