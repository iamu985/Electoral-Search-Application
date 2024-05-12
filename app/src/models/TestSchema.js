const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SchemaObject = {
    first_name: {type: String, required: true},
    middle_name: String,
    last_name: {type: String, required: true},
    mobile_number: {type: String, required: true, unique: true},
    status_of_employment: {type: String, default: "working"},
    number_of_family_members: {type: Number, default: 2, required:true, min: 2, max: 10},
    number_of_electors: {type: Number, default: 0, required: true, min: 1, max: 10},
    number_of_new_electors: {type: Number, default: 0, required: true, min: 0, max: 10},
    association_name: String,
    addresses: [
        {
            district: String,
            municiplity: String,
            block: String,
            gp: String,
            village: String,
            landmark: String,
            remarks: String
        }
    ]
}


const schema = new Schema(SchemaObject);
const TestModel = mongoose.model('TestModel', schema);

module.exports = TestModel;