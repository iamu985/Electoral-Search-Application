$(document).ready(function () {
    var alert = $('#fValidationNotif2');
    alert.addClass('f-hidden');

    $('#fullName').blur(function () {
        var fullName = $(this).val();
        if (fullName === "") {
            $(this).addClass('f-error');
            alert.removeClass('f-hidden');
        } else {
            $(this).removeClass('f-error');
            alert.addClass('f-hidden');
        }
    });

    var retiredSection = $('#retiredSection');
    var dateOfJoining = $('#dateOfJoining');
    var statusOfEmployment = $('#statusOfEmployment');

    function handleEmploymentStatus() {
        var status = statusOfEmployment.val();
        if (status === 'Working') {
            retiredSection.addClass('f-hidden');
            dateOfJoining.removeClass('f-hidden');
        } else {
            retiredSection.removeClass('f-hidden');
            dateOfJoining.addClass('f-hidden');
        }
    }

    handleEmploymentStatus();

    var leadershipRoleProp = $('#hasPlayedLeadershipRole');
    var followUpQuestion = $('#whichStageWrapper');

    leadershipRoleProp.change(function () {
        var answer = $(this).val();
        if (answer === 'Yes') {
            followUpQuestion.removeClass('f-hidden').addClass('f-visible');
        } else {
            followUpQuestion.addClass('f-hidden').removeClass('f-visible');
        }
    });

    // prefill district address data
    $.ajax({
        url: '/session-data',
        method: 'GET',
        success: function (formData) {
            // console.log(`FormData: ${JSON.stringify(formData)}`)
            var address = formData.addresses;
            // console.log(`Address: ${JSON.stringify(address), null, 2}`)
            $('#districtName').val(address.district);
            $('#municipalityName').val(address.municipality);
            $('#blockName').val(address.block);
            $('#gp').val(address.gp);
            $('#villageName').val(address.village);
            $('#landMark').val(address.landmark);
            $('#remarksContent').val(address.remarks);
        },
        error: function (err) {
            alert('Error: ', err);
        }
    });

    $('#nextPageBtn').click(function (event) {
        event.preventDefault();
        if (!validateForm()) {
            alert.text('Please fill in all required fields.').removeClass('f-hidden');
            return;
        }
        const formData = collectFormData();
        // console.log(formData); // Debugging - see the collected data object
        $.ajax({
            url: '/information1', // Change to your endpoint
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                // Handle the response
                // console.log(response);
                if (response.success) {
                    window.location.href = response.redirect;
                }
            },
            error: function (error) {
                // Handle the error
                console.error(error);
            }
        });
    });

    function validateForm() {
        var isValid = true;
        $('#detailForm [required]').each(function () {
            if ($(this).val() === "") {
                $(this).addClass('f-error');
                isValid = false;
            } else {
                $(this).removeClass('f-error');
            }
        });
        return isValid;
    }

    function getAdditionalDetails(form, employmentStatus) {
        returnValue = {}
        if (employmentStatus.toLowerCase() === 'retired') {
            returnValue =
            {
                trade_union_right_on: form.find('[name="trade_union_right_on"]').val(),
                played_leadership_role_stage: form.find('[name="played_leadership_role_stage"]').val(),
                contact_leader_name: form.find('[name="contact_leader_name"]').val(),
                had_taken_opposition_membership: form.find('[name="had_taken_opposition_membership"]').val(),
                has_played_leadership_role: form.find('[name="has_played_leadership_role"]').val(),
                played_leadership_role_stage: form.find('[name="played_leadership_role_stage"]').val()
            }
        } else {
            returnValue =
            {
                trade_union_right_on: null,
                played_leadership_role_stage: null,
                contact_leader_name: form.find('[name="contact_leader_name"]').val(),
                had_taken_opposition_membership: null,
                has_played_leadership_role: null,
                played_leadership_role_stage: null
            }
        }
        return returnValue;

    }

    function collectFormData() {
        const form = $('#detailForm');
        const formData = {
            fullname: form.find('[name="fullname"]').val(),
            nickname: form.find('[name="nickname"]').val(),
            dob: form.find('[name="dob"]').val(),
            caste: form.find('[name="caste"]').val(),
            religion: form.find('[name="religion"]').val(),
            status_of_employment: form.find('[name="status_of_employment"]').val(),
            had_taken_opposition_membership: form.find('[name="had_taken_opposition_membership"]').val(),
            trade_union_right_on: form.find('[name="trade_union_right_on"]').val(),
            has_played_leadership_role: form.find('[name="has_played_leadership_role"]').val(),
            played_leadership_role_stage: form.find('[name="played_leadership_role_stage"]').val(),
            job_details: {
                designation: form.find('[name="designation"]').val(),
                nature_of_job: form.find('[name="nature_of_job"]').val(),
                date_of_joining: form.find('[name="date_of_joining"]').val(),
                employment_organization_name: form.find('[name="employment_organization_name"]').val()
            },
            addresses: {
                district: form.find('[name="district"]').val(),
                municipality: form.find('[name="municipality"]').val(),
                block: form.find('[name="block"]').val(),
                gp: form.find('[name="gp"]').val(),
                village: form.find('[name="village"]').val(),
                landmark: form.find('[name="landmark"]').val(),
                remarks: form.find('[name="remarks"]').val()
            }
        };

        formData.additional_details = getAdditionalDetails(form, formData.status_of_employment);

        return formData;
    }
});