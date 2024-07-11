$(document).ready(function () {
    let familyMembers = [];
    let beneficiarySchemes = [];

    function collectBeneficiarySchemes() {
        const schemes = [];
        $('#beneficiarySchemesTable tbody tr').each(function () {
            const schemeName = $(this).find('td').eq(0).text();
            if (schemeName) {
                schemes.push(schemeName);
            }
        });
        return schemes;
    }

    $('#addFamilyMemberBtn').click(function () {
        clearModalFields();
        $('#familyMemberModalLabel').text('Add Family Member');
        $('#saveFamilyMemberBtn').data('index', -1);
        $('#familyMemberModal').modal('show');
    });

    $('#saveFamilyMemberBtn').click(function () {
        const index = $(this).data('index');
        const familyMember = collectModalData();

        if (index === -1) {
            familyMembers.push(familyMember);
        } else {
            familyMembers[index] = familyMember;
        }
        $('#familyMemberModal').modal('hide');
        displayFamilyMembers();
    });

    function clearModalFields() {
        $('#familyMemberModal input, #familyMemberModal select').val('');
        $('#institutionInformation, #associatedOrganizationInformation').addClass('d-none');
    }

    function collectModalData() {
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
                in_leadership_role: $('#attached_association_in_leadership_role').val(),
            },
            beneficiary_scheme: collectBeneficiarySchemes()
        };
    }

    function displayFamilyMembers() {
        const container = $('#familyMembersList');
        container.empty();
        familyMembers.forEach((member, index) => {
            const card = createFamilyMemberCard(member, index);
            container.append(card);
        });
    }

    function createFamilyMemberCard(member, index) {
        return `
        <div class="col-sm-12 col-md-6">
          <div class="f-card">
            <div>
              <strong>${member.firstname} ${member.middlename || ''} ${member.lastname}</strong>
              <p>Relationship: ${member.relationship}</p>
              <p>Age: ${member.age}</p>
              <p>Is Student: ${member.is_student}</p>
              <p>Is New Elector: ${member.is_new_elector}</p>
            </div>
            <div class="card-buttons">
              <button type="button" class="btn btn-sm btn-primary edit-family-member" data-index="${index}">Edit</button>
              <button type="button" class="btn btn-sm btn-danger delete-family-member" data-index="${index}">Delete</button>
            </div>
          </div>
        </div>
      `;
    }

    $(document).on('click', '.edit-family-member', function () {
        const index = $(this).data('index');
        const member = familyMembers[index];
        fillModalFields(member);
        $('#familyMemberModalLabel').text('Edit Family Member');
        $('#saveFamilyMemberBtn').data('index', index);
        $('#familyMemberModal').modal('show');
    });

    $(document).on('click', '.delete-family-member', function () {
        const index = $(this).data('index');
        familyMembers.splice(index, 1);
        displayFamilyMembers();
    });

    function fillModalFields(member) {
        $('#family_member_first_name').val(member.firstname);
        $('#family_member_middle_name').val(member.middlename);
        $('#family_member_last_name').val(member.lastname);
        $('#family_member_relationship').val(member.relationship);
        $('#is_student').val(member.is_student);
        $('#is_new_elector').val(member.is_new_elector);
        $('#age').val(member.age);
        $('#name_of_institution').val(member.institution_information.name_of_institution);
        $('#state_of_institution').val(member.institution_information.state_of_institution);
        $('#club').val(member.institution_information.club);
        $('#attached_association_name_of_organization').val(member.associated_association.name_of_organization);
        $('#attached_association_association_phone').val(member.associated_association.phone);
        $('#attached_association_in_leadership_role').val(member.associated_association.in_leadership_role);

        toggleInstitutionOrAssociationBlock();
    }

    $('#is_student').change(toggleInstitutionOrAssociationBlock);

    function toggleInstitutionOrAssociationBlock() {
        const isStudent = $('#is_student').val();
        if (isStudent === 'Yes') {
            $('#institutionInformation').removeClass('d-none');
            $('#associatedOrganizationInformation').addClass('d-none');
        } else {
            $('#institutionInformation').addClass('d-none');
            $('#associatedOrganizationInformation').removeClass('d-none');
        }
    }

    $('#addBeneficiarySchemeBtn').click(function () {
        $('#scheme_name').val('');
        $('#beneficiarySchemeModal').modal('show');
    });

    $('#saveBeneficiarySchemeBtn').click(function () {
        const schemeName = $('#scheme_name').val();
        if (schemeName) {
            beneficiarySchemes.push(schemeName);
            displayBeneficiarySchemes();
            $('#beneficiarySchemeModal').modal('hide');
        }
    });

    function displayBeneficiarySchemes() {
        const tableBody = $('#beneficiarySchemesTable tbody');
        tableBody.empty();
        beneficiarySchemes.forEach((scheme, index) => {
            const row = `
          <tr>
            <td>${scheme}</td>
            <td><button type="button" class="btn btn-sm btn-danger remove-beneficiary-scheme" data-index="${index}">&times;</button></td>
          </tr>
        `;
            tableBody.append(row);
        });
    }

    $(document).on('click', '.remove-beneficiary-scheme', function () {
        const index = $(this).data('index');
        beneficiarySchemes.splice(index, 1);
        displayBeneficiarySchemes();
    });

    $('#nextPageBtn').click(function (event) {
        event.preventDefault();
        if (!validateForm()) {
            alert('Please fill in all required fields.');
            return;
        }
        const formData = collectFormData();
        // console.log(formData); // Debugging - see the collected data object
        $.ajax({
            url: '/information2',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                // console.log(response);
                if (response.success) {
                    window.location.href = response.redirect;
                }
            },
            error: function (error) {
                console.error(error);
            }
        });
    });

    function validateForm() {
        var isValid = true;
        $('#familyForm [required]').each(function () {
            if ($(this).val() === "") {
                $(this).addClass('f-error');
                isValid = false;
            } else {
                $(this).removeClass('f-error');
            }
        });
        return isValid;
    }

    function collectFormData() {
        const form = $('#familyForm');
        return {
            number_of_electors: form.find('[name="number_of_electors"]').val(),
            number_of_family_members: form.find('[name="number_of_family_members"]').val(),
            total_earning_members: form.find('[name="total_earning_members"]').val(),
            family_information: {
                family_type: form.find('[name="family_type"]').val(),
                family_members: familyMembers,
                beneficiary_scheme: collectBeneficiarySchemes()
            }
        };
    }

    // Prefill existing data
    $.ajax({
        url: '/session-data',
        method: 'GET',
        success: function (formData) {
            $('#numberOfFamilyMembers').val(formData.number_of_family_members);
            $('#numberOfElectors').val(formData.number_of_electors);
        }
    });
});