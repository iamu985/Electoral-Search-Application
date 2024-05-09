const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SchemaObject = {
    first_name: {type: String, required: true},
    middle_name: String,
    last_name: {type: String, required: true},
    mobile_number: {type: String, required: true, unique: true},
    dob: {type: Date, required: true},
    caste: String,
    religion: String,
    status_of_employment: {type: String, default: "working"},
    
    job_details: {
        designation: {type: String, required: true},
        date_of_joining: {type: Date, required: true}
    },

    leadership_role_information: {
        type: String,
        unit: String,
        sector: String,
        block: String,
        subdivision: String,
        district: String,
        municipality: String,
        gp: String,
        village: String,
        ward: String,
        para: String
    },
    
    family_information: {
        family_type: String,
        family_members: [
            {
                relationship: String,
                first_name: String,
                middle_name: String,
                last_name: String,
                is_new_elector: Boolean,
                is_children: Boolean,
                is_student: Boolean,
                
                institution_information: {
                    institution_name: String,
                    club: [String],
                    has_scheme: Boolean,
                    beneficiary_scheme: [String]
                },
                attached_organization: Boolean,
                attached_organization_information: {
                    contact_person_name: String,
                    phone: String,
                    organization_name: String
                }
            }
        ]
    },

    additional_details: {
        trade_union_right_existed: Boolean,
        other_front: String,
        contact_leader_name: String
    },
    
    evaluation: {
        role_play: {
            organization: String,
            working_area: Boolean,
            concern_association: Boolean,
            regular_manner: Boolean,
        },
        questions: [
            {
                question: String,
                answer: String,
                number: Number
            }
        ],
        compliers_note: String
    }

}

const schema = mongoose.Schema(SchemaObject);
const DataModel = mongoose.model('DataModel', schema);

module.exports = DataModel;