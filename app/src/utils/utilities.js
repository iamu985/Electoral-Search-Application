const { json } = require('express');
const { read } = require('fs');
const fs = require('fs/promises');
const path = require('path');

const TestModel = require('../../src/models/TestSchema');
const DataModel = require('../../src/models/Schema');
const { Model } = require('mongoose');


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

async function saveToDatabase(jsondata, debug=true) {
    console.warn('Initiating saving to database. Make sure the data is cleaned and validated.');
    let Model, modelInstance;
    if (debug) {
        Model = TestModel;
    } else {
        Model = DataModel;
    }

    modelInstance = new Model(jsondata);
    await modelInstance.save().then(() => {
        console.log('Saved to database.');
    }).catch(err => {
        console.log(`Error: ${err}`);
    })
}


module.exports = { saveData, readData, saveToDatabase }