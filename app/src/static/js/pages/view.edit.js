
$(document).ready(function () {
    // Function to get data from the backend
    function getData(formId) {
        $.ajax({
            url: `/webservice/api/v1/getDataById/${formId}`,
            method: 'GET',
            success: function (data) {
                console.log(`ReceivedData: ${JSON.stringify(data)}`);
                sessionStorage.setItem('data', JSON.stringify(data.data));
                initializeClickHandler(); // Initialize the click handler after data is set
            },
            error: function (xhr, status, err) {
                alert(`Error Occurred: ${err}\nStatusCode: ${status}`);
            }
        });
    }

    // Handle adding family member
    $('#addFamilyMemberBtn').click(function () {
        clearModalFields();
        $('#familyMemberModalLabel').text('Add Family Member');
        $('#saveFamilyMemberBtn').data('index', -1);
        $('#familyMemberModal').modal('show');
    });

    function clearModalFields() {
        $('#familyMemberModal input, #familyMemberModal select').val('');
        // $('#institutionInformation, #associatedOrganizationInformation').addClass('d-none');
    }

    // Handle save changes for family member
    $('#saveFamilyMemberBtn').click(function () {
        console.log('#saveFamilyMemberBtn invoked')
        const index = $(this).data('index');
        const familyMember = collectModalData();

        let data = JSON.parse(sessionStorage.getItem('data'));

        if (index === -1) {
            data.family_information.family_members.push(familyMember);
        } else {
            data.family_information.family_members[index] = familyMember;
        }
        sessionStorage.setItem('data', JSON.stringify(data));
        $('#familyMemberModal').modal('hide');
        updateFamilyTable(data.family_information.family_members);
    });

    function collectModalData() {
        console.log('Inside collectModalData')
        return {
            firstname: $('#family_member_first_name').val(),
            middlename: $('#family_member_middle_name').val(),
            lastname: $('#family_member_last_name').val(),
            relationship: $('#family_member_relationship').val(),
            is_student: $('#is_student').val(),
            is_new_elector: $('#is_new_elector').val(),
            age: $('#age').val(),
            institution_information: {
                name_of_institution: $('#name_of_institution').val(),
                state_of_institution: $('#state_of_institution').val(),
                club: $('#club').val()
            },
            associated_association: {
                name_of_organization: $('#attached_association_name_of_organization').val(),
                phone: $('#attached_association_association_phone').val(),
                in_leadership_role: $('#attached_association_in_leadership_role').val()
            }
        };
    }

    // Handle adding beneficiary scheme
    $('#addBeneficiarySchemeBtn').click(function () {
        $('#scheme_name').val('');
        $('#beneficiarySchemeModal').modal('show');
    });

    $('#saveBeneficiarySchemeBtn').click(function () {
        console.log('saveBeneficiarySchemeBtn invoked.')
        const schemeName = $('#scheme_name').val();
        if (schemeName) {
            let data = JSON.parse(sessionStorage.getItem('data'));
            console.log('data received: \n', JSON.stringify(data))
            data.family_information.beneficiary_scheme.push(schemeName);
            sessionStorage.setItem('data', JSON.stringify(data));
            $('#beneficiarySchemeModal').modal('hide');
            updateSchemeTable(data.family_information.beneficiary_scheme);
        }
    });

    // Function to initialize click handlers
    function initializeClickHandler() {
        console.log('initializeClickHandler invoked.')
        const data = JSON.parse(sessionStorage.getItem('data'));
        $('.edit-member').click(function () {
            console.log(`FromGetData: ${JSON.stringify(data)}`);
            const index = $(this).data('index');
            const member = data.family_information.family_members[index];
            $('#editMemberIndex').val(index);
            $('#edit_firstname').val(member.firstname);
            $('#edit_middlename').val(member.middlename);
            $('#edit_lastname').val(member.lastname);
            $('#edit_relationship').val(member.relationship);
            $('#edit_is_student').val(member.is_student);
            $('#edit_is_new_elector').val(member.is_new_elector);
            $('#edit_age').val(member.age);
            $('#edit_name_of_institution').val(member.institution_information.name_of_institution);
            $('#edit_state_of_institution').val(member.institution_information.state_of_institution);
            $('#edit_club').val(member.institution_information.club);

            $('#edit_name_of_organization').val(member.associated_association.name_of_organization);
            $('#edit_association_phone').val(member.associated_association.phone);
            $('#edit_in_leadership_role').val(member.associated_association.in_leadership_role);
            $('#editMemberModal').modal('show');
        });

        // Handle delete button click for family member
        $('.delete-member').click(function () {
            const index = $(this).data('index');
            let data = JSON.parse(sessionStorage.getItem('data'));
            data.family_information.family_members.splice(index, 1);
            sessionStorage.setItem('data', JSON.stringify(data));
            updateFamilyTable(data.family_information.family_members);
        });

        // Handle delete button click for beneficiary scheme
        $('.delete-scheme').click(function () {
            const index = $(this).data('index');
            let data = JSON.parse(sessionStorage.getItem('data'));
            data.family_information.beneficiary_scheme.splice(index, 1);
            sessionStorage.setItem('data', JSON.stringify(data));
            updateSchemeTable(data.family_information.beneficiary_scheme);
        });

        // Handle save changes for family member
        $('#saveMemberChanges').click(function () {
            console.log('saveMemberChanges invoked.')
            const index = $('#editMemberIndex').val();
            const updatedMember = {
                firstname: $('#edit_firstname').val(),
                middlename: $('#edit_middlename').val(),
                lastname: $('#edit_lastname').val(),
                relationship: $('#edit_relationship').val(),
                is_student: $('#edit_is_student').val(),
                is_new_elector: $('#edit_is_new_elector').val(),
                age: $('#edit_age').val(),
                institution_information: {
                    name_of_institution: $('#edit_name_of_institution').val(),
                    state_of_institution: $('#edit_state_of_institution').val(),
                    club: $('#edit_club').val()
                },
                associated_association: {
                    name_of_organization: $('#edit_name_of_organization').val(),
                    phone: $('#edit_association_phone').val(),
                    in_leadership_role: $('#edit_in_leadership_role').val()
                }
            };
            console.log('Updated Member: \n', JSON.stringify(updatedMember))
            data.family_information.family_members[index] = updatedMember;
            sessionStorage.setItem('data', JSON.stringify(data));
            $('#editMemberModal').modal('hide');
            updateFamilyTable(data.family_information.family_members);
        });

        // Handle modal close for family member
        $('.modalFamilyClose').click(function () {
            $('#editMemberModal').modal('hide');
        });

        // Handle beneficiary scheme edit button click
        $('.edit-scheme').click(function () {
            const index = $(this).data('index');
            const scheme = data.family_information.beneficiary_scheme[index];
            $('#editSchemeIndex').val(index);
            $('#edit_scheme_name').val(scheme);
            $('#editSchemeModal').modal('show');
        });

        // Handle save changes for beneficiary scheme
        $('#saveSchemeChanges').click(function () {
            const index = $('#editSchemeIndex').val();
            const updatedScheme = $('#edit_scheme_name').val();
            data.family_information.beneficiary_scheme[index] = updatedScheme;
            sessionStorage.setItem('data', JSON.stringify(data));
            $('#editSchemeModal').modal('hide');
            updateSchemeTable(data.family_information.beneficiary_scheme);
        });

        // Handle modal close for beneficiary scheme
        $('.modalBeneficiaryClose').click(function () {
            $('#editSchemeModal').modal('hide');
        });

        // Handle saving final data
        $('.save-view-data').click(function () {
            console.log('Clicked saved on data');
            const formData = collectFormData();
            console.log('Saving view data', formData);
            $.ajax({
                url: `/webservice/api/v1/updateDataById/${formData._id}`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function (updatedData) {
                    sessionStorage.setItem('updatedData', JSON.stringify(updatedData));
                    $('#displaySuccessMessageModal').modal('show');
                },
                error: function (xhr, status, err) {
                    alert(`Error: ${err}\nStatus: ${status}\nXHR: ${JSON.stringify(xhr)}`);
                }
            });
        });
    }

    const formId = $('#editForm').data('form-id');
    getData(formId);

    $('#goBackBtn').click(function () {
        window.location.href = `/view/${formId}`;
    });

    // Function to collect form data
    function collectFormData() {
        console.log('collectFormData invoked.');
        const form = $('#editForm');
        const data = JSON.parse(sessionStorage.getItem('data'));
        console.log('Data in sessionstorage: \n', JSON.stringify(data));

        const updatedData = {
            _id: data._id,
            external_form_id: form.find('[name="external_form_id"]').val(),
            fullname: form.find('[name="fullname"]').val(),
            nickname: form.find('[name="nickname"]').val(),
            dob: form.find('[name="dob"]').val(),
            caste: form.find('[name="caste"]').val(),
            religion: form.find('[name="religion"]').val(),
            number_of_electors: form.find('[name="number_of_electors"]').val(),
            number_of_family_members: form.find('[name="number_of_family_members"]').val(),
            total_earning_members: form.find('[name="total_earning_members"]').val(),
            job_details: {
                designation: form.find('[name="designation"]').val(),
                date_of_joining: form.find('[name="date_of_joining"]').val(),
                nature_of_job: form.find('[name="nature_of_job"]').val(),
                employment_organization_name: form.find('[name="employment_organization_name"]').val()
            },
            status_of_employment: form.find('[name="status_of_employment"]').val(),
            addresses: {
                district: form.find('[name="district"]').val(),
                municipality: form.find('[name="municipality"]').val(),
                block: form.find('[name="block"]').val(),
                gp: form.find('[name="gp"]').val(),
                village: form.find('[name="village"]').val(),
                landmark: form.find('[name="landmark"]').val(),
                remarks: form.find('[name="remarks"]').val()
            },
            additional_details: {
                contact_leader_name: form.find('[name="contact_leader_name"]').val(),
                had_taken_opposition_membership: form.find('[name="had_taken_opposition_membership"]').val(),
                trade_union_right_on: form.find('[name="trade_union_right_on"]').val(),
                has_played_leadership_role: form.find('[name="has_played_leadership_role"]').val(),
                played_leadership_role_stage: form.find('[name="played_leadership_role_stage"]').val()
            },
            family_information: {
                family_type: form.find('[name="family_type"]').val(),
                number_of_family_members: form.find('[name="number_of_family_members"]').val(),
                number_of_electors: form.find('[name="number_of_electors"]').val(),
                family_members: data.family_information.family_members,
                beneficiary_scheme: data.family_information.beneficiary_scheme
            },
            evaluation: {
                role_play: {
                    organization: form.find('[name="organization"]').val(),
                    working_area: form.find('[name="working_area"]').val(),
                    concern_association: form.find('[name="concern_association"]').val(),
                    regular_manner: form.find('[name="regular_manner"]').val()
                },
                questions: data.evaluation.questions.map((question, index) => ({
                    question: form.find(`[name="questions[${index}].question"]`).val(),
                    answer: form.find(`[name="questions[${index}].answer"]`).val()
                }))
            }
        };
        console.log('Updated Data: \n', JSON.stringify(updatedData));

        return updatedData;
    }

    // Function to update family table
    function updateFamilyTable(familyMembers) {
        const tableBody = $('#fFamilyTable tbody');
        tableBody.empty();
        familyMembers.forEach((member, index) => {
            tableBody.append(`
        <tr>
          <td>
            <button type="button" class="btn btn-warning edit-member" data-index="${index}">Edit</button>
            <button type="button" class="btn btn-danger delete-member" data-index="${index}">Delete</button>
          </td>
          <td>${member.firstname}</td>
          <td>${member.middlename}</td>
          <td>${member.lastname}</td>
          <td>${member.relationship}</td>
          <td>${member.is_student}</td>
          <td>${member.is_new_elector}</td>
          <td>${member.age}</td>
        </tr>
      `);
        });
        initializeClickHandler(); // Reinitialize click handlers after updating the DOM
    }

    // Function to update scheme table
    function updateSchemeTable(beneficiarySchemes) {
        const tableBody = $('#fBeneficiarySchemes tbody');
        tableBody.empty();
        beneficiarySchemes.forEach((scheme, index) => {
            tableBody.append(`
        <tr>
          <td>
            <button type="button" class="btn btn-warning edit-scheme" data-index="${index}">Edit</button>
            <button type="button" class="btn btn-danger delete-scheme" data-index="${index}">Delete</button>
          </td>
          <td>${scheme}</td>
        </tr>
      `);
        });
        initializeClickHandler(); // Reinitialize click handlers after updating the DOM
    }
});
