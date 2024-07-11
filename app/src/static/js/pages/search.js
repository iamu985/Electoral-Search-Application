$(document).ready(function () {
    function searchSettings(entityType) {
        let queryData = { entity_type: entityType, value: null };
        $.ajax({
            url: '/webservice/api/v1/settings/search',
            method: 'GET',
            data: queryData,
            success: function (response) {
                if (response.success) {
                    displayResults(response.data);
                } else {
                    alert('No results found');
                }
            },
            error: function (err) {
                alert('Error: ' + err.responseText);
            }
        });
    }

    function settingsSearchAndDisplay(searchValue) {
        let entityType = $('#entityType').val();
        $.ajax({
            url: '/webservice/api/v1/settings/search',
            method: 'GET',
            data: { entity_type: entityType, value: searchValue },
            success: function (response) {
                if (response.success) {
                    displayResults(response.data);
                } else {
                    alert('No results found');
                }
            },
            error: function (err) {
                alert('Error: ' + err.responseText);
            }
        });
    }

    function displayResults(results) {
        const tableBody = $('#resultsTable tbody');
        tableBody.empty();

        if (results.length > 0) {
            results.forEach(result => {
                const row = `
            <tr>
              <td>${result.entity_type}</td>
              <td>
                <input type="text" class="form-control" value="${result.value}" data-id="${result._id}" readonly>
              </td>
              <td>
                <button class="btn btn-sm btn-primary f-btn-col-1 edit-btn" data-id="${result._id}">Edit</button>
                <button class="btn btn-sm btn-danger f-btn-col-danger delete-btn" data-id="${result._id}">Delete</button>
              </td>
            </tr>
          `;
                tableBody.append(row);
            });
        } else {
            tableBody.append('<tr><td colspan="3" class="text-center">No results found</td></tr>');
        }
    }

    $('#addBtn').click(function () {
        const entityType = $('#entityType').val();
        const value = $('#value').val();

        if (value) {
            $.ajax({
                url: '/webservice/api/v1/settings/add',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    entityType,
                    value
                }),
                success: function (response) {
                    if (response.success) {
                        alert('Value added successfully');
                        $('#value').val('');
                        displayResults(response.data);
                        return;
                    } else {
                        alert('Error adding value');
                    }
                },
                error: function (err) {
                    alert('Error: ' + err.responseText);
                }
            });
        } else {
            alert('Please enter a value');
        }
    });

    $('#searchBtn').click(function () {
        settingsSearchAndDisplay($('#settingsSearchValue').val());
    });

    $('#entityType').change(function () {
        searchSettings($(this).val());
    });

    $('#settingsSearchValue').keyup(function () {
        settingsSearchAndDisplay($(this).val());
    });

    $(document).on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        const inputField = $(`input[data-id="${id}"]`);
        const entityType = $('#entityType').val();
        if ($(this).text() === 'Edit') {
            inputField.prop('readonly', false).focus();
            $(this).text('Save');
        } else {
            const newValue = inputField.val();
            $.ajax({
                url: `/webservice/api/v1/settings/edit/${id}`,
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify({ entity_type: entityType, value: newValue }),
                success: function (response) {
                    if (response.success) {
                        alert('Value updated successfully');
                        inputField.prop('readonly', true);
                        $(`button[data-id="${id}"].edit-btn`).text('Edit');
                        searchSettings($('#entityType').val());
                    } else {
                        alert('Error updating value');
                    }
                },
                error: function (err) {
                    alert('Error: ' + err.responseText);
                }
            });
        }
    });

    $(document).on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this value?')) {
            $.ajax({
                url: `/webservice/api/v1/settings/delete/${id}`,
                method: 'DELETE',
                success: function (response) {
                    if (response.success) {
                        alert('Value deleted successfully');
                        searchSettings($('#entityType').val());
                    } else {
                        alert('Error deleting value');
                    }
                },
                error: function (err) {
                    alert('Error: ' + err.responseText);
                }
            });
        }
    });

    $('#importFile').change(function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                $.ajax({
                    url: '/webservice/api/v1/settings/import',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ data: json }),
                    success: function (response) {
                        if (response.success) {
                            alert('Data imported successfully');
                            searchSettings($('#entityType').val());
                        } else {
                            alert('Error importing data');
                        }
                    },
                    error: function (err) {
                        alert('Error: ' + err.responseText);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        }
    });

    searchSettings($('#entityType').val());
});