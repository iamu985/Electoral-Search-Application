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
    beneficiary_scheme: [String]
  },
  associated_association: {
    name_of_organization: String,
    phone: String,
    in_leadership_role: String
  }
});

const SchemaObject = {
  id: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  middlename: String,
  lastname: { type: String, required: true },
  mobile_number: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  caste: String,
  religion: String,
  status_of_employment: { type: String, default: "working" },
  number_of_family_members: { type: Number, default: 2, required: true, min: 2, max: 10 },
  number_of_electors: { type: Number, default: 0, required: true, min: 1, max: 10 },
  number_of_new_electors: { type: Number, default: 0, required: true, min: 0, max: 10 },
  association_name: String,
  job_details: {
    designation: { type: String },
    date_of_joining: { type: Date },
    nature_of_job: { type: String },
    employment_organization_name: String
  },
  address: {
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
    family_members: [familyMemberSchema]
  },
  additional_details: {
    trade_union_right_on: String,
    other_front: String,
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

// Define the virtual property 'fullname'
schema.virtual('fullname').get(function() {
  if (this.middlename) {
    return `${this.firstname} ${this.middlename} ${this.lastname}`;
  } else {
    return `${this.firstname} ${this.lastname}`;
  }
});

// Ensure virtual fields are serialized.
schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

const DataModel = mongoose.model('DataModel', schema);

module.exports = DataModel;