const XLSX = require('xlsx');
const { faker } = require('@faker-js/faker');
const fs = require('fs');

function generateDummyData(number=10) {
  const data = [];

  for (let i = 0; i < number; i++) { // Generate 100 rows of data
    const familyMembers = [
      {
        relationship: 'Son',
        is_new_elector: faker.helpers.arrayElement(['Yes', 'No']),
        is_student: faker.helpers.arrayElement(['Yes', 'No']),
        age: faker.datatype.number({ min: 5, max: 100 }),
        institution_information: {
          name_of_institution: faker.company.name(),
          state_of_institution: faker.address.state(),
          club: faker.company.name(),
          beneficiary_scheme: [faker.company.name(), faker.company.name()]
        },
        associated_association: {
          name_of_organization: faker.company.name(),
          phone: faker.phone.number(),
          in_leadership_role: faker.helpers.arrayElement(['Yes', 'No'])
        }
      }
    ];

    const questions = [
      { question: 'Will you play role in your residing area?', answer: 'Yes' },
      { question: 'Will you be able to organize people to join in a movement?', answer: 'Yes' },
      { question: 'Do you believe in the movement?', answer: 'Yes' },
      { question: 'Can you motivate other family members towards organizational goals?', answer: 'Yes' },
      { question: 'What form of movements attracts you?', answer: 'NA' },
      { question: 'Compliers Note', answer: 'NA' }
    ];

    const row = {
      'First Name': faker.name.firstName(),
      'Middle Name': faker.name.middleName(),
      'Last Name': faker.name.lastName(),
      'Mobile Number': faker.phone.number(),
      'Date of Birth': faker.date.past(50, '2000-01-01').toISOString().split('T')[0],
      'Caste': faker.helpers.arrayElement(['SC', 'ST', 'OBC', 'General']),
      'Religion': faker.helpers.arrayElement(['Christian', 'Hindu', 'Muslim', 'Jain', 'Buddhist', 'Other']),
      'Status of Employment': faker.helpers.arrayElement(['Working', 'Retired']),
      'Number of Family Members': faker.datatype.number({ min: 2, max: 10 }),
      'Number of Electors': faker.datatype.number({ min: 1, max: 10 }),
      'Number of New Electors': faker.datatype.number({ min: 0, max: 10 }),
      'Association Name': faker.company.name(),
      'Designation': faker.name.jobTitle(),
      'Date of Joining': faker.date.past(10).toISOString().split('T')[0],
      'Nature of Job': faker.helpers.arrayElement(['Permanent', 'Contractual']),
      'Employment Organization Name': faker.company.name(),
      'Family Type': faker.helpers.arrayElement(['Nuclear', 'Joint']),
      'Family Members': JSON.stringify(familyMembers),
      'Role Play Organization': 'Active',
      'Working Area': faker.helpers.arrayElement(['Yes', 'No']),
      'Concern Association': faker.helpers.arrayElement(['Yes', 'No']),
      'Regular Manner': faker.helpers.arrayElement(['Yes', 'No']),
      'Questions': JSON.stringify(questions)
    };

    data.push(row);
  }

  return data;
}

function createExcelFile(data, filePath) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    XLSX.writeFile(workbook, filePath);
  }
  

module.exports = {generateDummyData, createExcelFile};

