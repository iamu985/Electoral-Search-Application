$(document).ready(function () {
    var alert = $('#fValidationNotif');
    alert.addClass('f-hidden');

    $('#firstName, #lastName, #phoneNumber, #number_of_family_members, #number_of_electors, #number_of_new_electors, #associationName, #statusOfEmployment, #districtName, #municipalityName, #blockName, #gp, #villageName').blur(function () {
        var input = $(this);
        if (input.val() === "") {
            input.addClass('f-error');
            alert.removeClass('f-hidden');
            alert.text('Please fill out all required fields.');
        } else {
            input.removeClass('f-error');
            alert.addClass('f-hidden');
        }
    });

    $('#nextPage').click(function (e) {
        e.preventDefault();
        if (!validateForm()) {
            alert.text('Please fill out all required fields.').removeClass('f-hidden');
            return;
        }
        var formData = collectFormData();
        // console.log(`POSTDATA: ${JSON.stringify(formData)}`);
        $.ajax({
            url: '/enrollment',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    window.location.href = response.redirect;
                }
            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error);
            }
        });
    });

    function validateForm() {
        var isValid = true;
        $('#enrollmentForm [required]').each(function () {
            if ($(this).val() === "") {
                $(this).addClass('f-error');
                isValid = false;
            } else {
                $(this).removeClass('f-error');
            }
        });
        return isValid;
    }

    $('#phoneNumber').on('blur change', function (e) {
        var mobileNumber = $(this).val();
        var phoneNumberPattern = /^[0-9]{10}$/;
        var patternMatch = phoneNumberPattern.test(mobileNumber);
        var validationMessage = "";

        if (!patternMatch) {
            validationMessage += 'Mobile Number does not match the required pattern i.e. length should be exactly 10.<br>';
        }

        $.ajax({
            url: `/webservice/api/v1/isUniqueMobileNumber/${mobileNumber}`,
            method: 'GET',
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    if (!response.isUnique) {
                        validationMessage += 'Mobile number already exists.<br>';
                    }
                } else {
                    console.log('Error: ' + response.error);
                }

                if (validationMessage !== "") {
                    alert.html(validationMessage).removeClass('f-hidden');
                    $('#phoneNumber').addClass('f-error');
                } else {
                    alert.addClass('f-hidden');
                    $('#phoneNumber').removeClass('f-error');
                }
            }
        });
    });

    function getFullName(firstname, middlename, lastname) {
        if (middlename !== '') {
            return firstname + ' ' + middlename + ' ' + lastname;
        } else {
            return firstname + ' ' + lastname;
        }
    }

    function toggleValidationAlert(validationMessage, validationState) {
        if (validationState) {
            $('#fValidationNotif').addClass('f-hidden');
        } else {
            var validationAlert = getValidationAlertDiv(validationMessage);
            $('#fValidationNotif').removeClass('f-hidden');
            $('#fValidationNotif').append(validationAlert);
        }
    }

    function getValidationAlertDiv(validationMessage) {
        return `
        <div id="f-notif-container">
          ${validationMessage}
        </div>
      `;
    }

    function collectFormData() {
        const form = $('#enrollmentForm');
        const formData = {
            external_form_id: form.find('[name="external_form_id"]').val(),
            firstname: form.find('[name="first_name"]').val(),
            middlename: form.find('[name="middle_name"]').val(),
            lastname: form.find('[name="last_name"]').val(),
            mobile_number: form.find('[name="mobile_number"]').val(),
            status_of_employment: form.find('[name="status_of_employment"]').val(),
            number_of_family_members: form.find('[name="number_of_family_members"]').val(),
            number_of_electors: form.find('[name="number_of_electors"]').val(),
            number_of_new_electors: form.find('[name="number_of_new_electors"]').val(),
            association_name: form.find('[name="association_name"]').val(),
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
        formData.fullname = getFullName(formData.firstname, formData.middlename, formData.lastname);
        return formData;
    }
});