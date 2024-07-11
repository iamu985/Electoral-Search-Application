$(document).ready(function () {
    const fieldMapping = {
        'firstname': 'First Name',
        'middlename': 'Middle Name',
        'lastname': 'Last Name',
        'age': 'Age',
        'id': 'Form Number',
        'designation': 'Designation',
        'status_of_employment': 'Status of Employment',
        'association': 'Association',
        'religion': 'Religion',
        'caste': 'Caste',
        'mobile_number': 'Mobile Number',
        'number_of_family_members': 'Number of Family Members',
        'number_of_electors': 'Number of Electors',
        'number_of_new_electors': 'Number of New Electors',
        'municipality': 'Municipality',
        'block': 'Block',
        'village': 'Village/Para/Ward Number',
        'institution_name': 'Institution Name',
        'state_of_institution': 'State of Institution',
        'beneficiary_scheme': 'Beneficiary Scheme',
        'club_name': 'Club Name',
        'dob': 'Date of Birth',
        'external_form_id': 'External Form Id',
        'family_member_first_name': 'Family Member First Name',
        'family_member_last_name': 'Family Member Last Name',
        'family_member_relationship': 'Family Member Relationship',
        'family_member_is_student': 'Family Member Is Student',
        'family_member_is_new_elector': 'Family Member Is New Elector',
        'total_earning_members': 'Total Earning Members'
    };

    const searchOptions = {
        'contains': 'ct',
        'is equal to (case-sensitive)': 'iec',
        'is equal to (case-insensitive)': 'ies',
        'starts with': 'sw',
        'is greater than': 'gt',
        'is greater than or equal to': 'gte',
        'is less than': 'lt',
        'is less than or equal to': 'lte',
        'not equal to': 'ne'
    };

    $.ajax({
        url: '/webservice/api/v1/getAllData',
        method: 'GET',
        success: function (response) {
            if (response.success) {
                displayResults(response.data);
            }
        },
        error: function (xhr, status, err) {
            alert(`Error Occurred: \nStatus: ${status}\nErrorDetail: ${err}\nHeaderNote: ${xhr}`);
        }
    });

    let queryIndex = 0;

    function createQueryFields(index) {
        const queryField = `
    <div class="row mb-3 query-group" data-index="${index}">
      <div class="col">
        <select class="form-control query-field" name="field_${index}">
          ${Object.keys(fieldMapping).map(key => `<option value="${key}">${fieldMapping[key]}</option>`).join('')}
        </select>
      </div>
      <div class="col">
        <select class="form-control query-option" name="option_${index}">
          ${Object.keys(searchOptions).map(option => `<option value="${searchOptions[option]}">${option}</option>`).join('')}
        </select>
      </div>
      <div class="col">
        <input type="text" class="form-control query-value" name="value_${index}" placeholder="Enter value">
      </div>
      <div class="col d-flex align-items-center">
        <button type="button" class="btn btn-secondary mx-1 query-and" data-index="${index}">AND</button>
        <button type="button" class="btn btn-secondary mx-1 query-or" data-index="${index}">OR</button>
        <button type="button" class="btn btn-danger mx-1 query-delete" data-index="${index}">Delete</button>
      </div>
    </div>`;

        const queryElement = $(queryField);
        queryElement.find('.query-field').on('change', function () {
            const selectedField = $(this).val();
            const queryValueInput = queryElement.find('.query-value');
            if (selectedField === 'dob' || selectedField === 'date_of_birth') {
                queryValueInput.attr('type', 'date');
            } else {
                queryValueInput.attr('type', 'text');
            }
        });

        return queryElement;
    }

    function addQueryField() {
        $('#queryContainer').append(createQueryFields(queryIndex));
        queryIndex++;
    }

    $('#queryBuilderBtn').click(function () {
        $('#queryBuilderModal').modal('show');
        addQueryField();
    });

    $('#addQueryBtn').click(function () {
        addQueryField();
    });

    $('#queryContainer').on('click', '.query-and, .query-or', function () {
        const index = $(this).data('index');
        $(this).siblings('.query-and, .query-or').prop('disabled', true).hide();
        $(this).prop('disabled', true);
        addQueryField();
    });

    $('#queryContainer').on('click', '.query-delete', function () {
        const index = $(this).data('index');
        $(`.query-group[data-index="${index}"]`).remove();
    });

    const convertValue = (value) => {
        console.log('Convert value');
        console.log(typeof (value), value);
        let verdict = Number(value);
        console.log(verdict)
        if (!isNaN(verdict)) {
            console.log('Returning number');
            return verdict
        } else {
            console.log('returning string')
            return value
        }
    }

    $('#executeQueryBtn').click(function () {
        const queryData = [];
        $('.query-group').each(function () {
            const index = $(this).data('index');
            const field = $(this).find('.query-field').val();
            const option = $(this).find('.query-option').val();
            const value = convertValue($(this).find('.query-value').val());
            queryData.push({
                field,
                option,
                value
            });
        });

        $.ajax({
            url: '/webservice/api/v1/search',
            method: 'GET',
            data: {
                queryData: JSON.stringify(queryData)
            },
            success: function (response) {
                $('#queryBuilderModal').modal('hide');
                if (response.success) {
                    displayResults(response.results);
                } else {
                    alert('No results found');
                }
            },
            error: function (err) {
                alert(`An error occurred while processing your request\nError: ${JSON.stringify(err)}`);
            }
        });
    });

    $('#goBackBtn').click(function () {
        window.location.href = '/';
    });

    function displayResults(results) {
        const resultsContainer = $('#searchResults');
        resultsContainer.empty();

        if (results.length > 0) {
            const table = $('<table class="table table-bordered" id="resultsTable"><thead><tr><th>Id</th><th>External Form Id</th><th>Full Name</th><th>Mobile Number</th><th>Association Name</th><th>Status Of Employment</th><th>Religion</th><th>Caste</th><th>Date Of Birth>/th><th>Actions</th></tr></thead><tbody></tbody></table>');
            results.forEach(result => {
                const row = `
          <tr>
            <td><a href="/view/${result._id}">${result._id}</a></td>
            <td>${result.external_form_id}</td>
            <td>${result.fullname}</td>
            <td>${result.mobile_number}</td>
            <td>${result.association_name}</td>
            <td>${result.status_of_employment}</td>
            <td>${result.religion}</td>
            <td>${result.caste}</td>
            <td>${result.dob}</td>
            <td><button class="btn btn-danger delete-btn" data-id="${result._id}">Delete</button></td>
          </tr>`;
                table.find('tbody').append(row);
            });
            resultsContainer.append(table);
        } else {
            resultsContainer.append('<p>No results found</p>');
        }
    }

    $('#exportToExcelBtn').click(function () {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(document.getElementById('resultsTable'));
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        XLSX.writeFile(wb, 'SearchResults.xlsx');
    });

    $('#searchResults').on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            $.ajax({
                url: `/webservice/api/v1/delete/${id}`,
                method: 'DELETE',
                success: function (response) {
                    if (response.success) {
                        displayResults(response.results);
                    } else {
                        alert('Error: ' + response.message);
                    }
                },
                error: function (xhr, status, err) {
                    alert(`Error Occurred: \nStatus: ${status}\nErrorDetail: ${err}\nHeaderNote: ${xhr}`);
                }
            });
        }
    });

    $('#deleteAllBtn').click(function () {
        if (confirm('Are you sure you want to delete all data?')) {
            $.ajax({
                url: '/webservice/api/v1/deleteAll',
                method: 'DELETE',
                success: function (response) {
                    if (response.success) {
                        $('#searchResults').html('<p>No results found</p>');
                    } else {
                        alert('Error: ' + response.message);
                    }
                },
                error: function (xhr, status, err) {
                    alert(`Error Occurred: \nStatus: ${status}\nErrorDetail: ${err}\nHeaderNote: ${xhr}`);
                }
            });
        }
    });
});