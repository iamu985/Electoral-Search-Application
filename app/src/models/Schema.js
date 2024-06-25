const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const familyMemberSchema = new Schema({
  relationship: String,
  firstname: String,
  middlename: String,
  lastname: String,
  is_new_elector: String,
  is_student: String,
  age: Number,
  institution_information: {
    name_of_institution: String,
    state_of_institution: String,
    club: String,
  },
  associated_association: {
    name_of_organization: String,
    phone: String,
    in_leadership_role: String
  }
});

const SchemaObject = {
  id: { type: String, required: true, unique: true },
  external_form_id: {type: String, unique: true},
  firstname: { type: String, required: true },
  middlename: String,
  lastname: { type: String, required: true },
  fullname: { type: String },
  nickname: String,
  mobile_number: { type: String, required: true, unique: true },
  dob: { type: Date },
  caste: String,
  religion: String,
  status_of_employment: { type: String, default: "working" },
  number_of_family_members: { type: Number, default: 2, min: 0, max: 10 },
  number_of_electors: { type: Number, default: 0, min: 0, max: 10 },
  number_of_new_electors: { type: Number, default: 0, min: 0, max: 10 },
  association_name: String,
  job_details: {
    designation: { type: String },
    date_of_joining: { type: Date },
    nature_of_job: { type: String },
    employment_organization_name: String
  },
  addresses: {
    block: String,
    district: String,
    municipality: String,
    gp: String,
    village: String,
    landmark: String,
    remarks: String
  },
  family_information: {
    family_type: String,
    family_members: [familyMemberSchema],
    beneficiary_scheme: [String]
  },
  additional_details: {
    trade_union_right_on: String,
    contact_leader_name: String,
    had_taken_opposition_membership: String,
    has_played_leadership_role: String,
    played_leadership_role_stage: String
  },
  evaluation: {
    role_play: {
      organization: String,
      working_area: String,
      concern_association: String,
      regular_manner: String
    },
    questions: [
      {
        question: String,
        answer: String
      }
    ],
    compliers_note: String
  }
};

const schema = new Schema(SchemaObject);


const DataModel = mongoose.model('DataModel', schema);

module.exports = DataModel;