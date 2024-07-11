$(document).ready(function () {
    $('#downloadExcelBtn').click(function () {
        const data = $('#btnContainer').data('datamodel');
        console.log(`Data to send: ${JSON.stringify(data)}`);
        $.ajax({
            url: '/webservice/api/v1/download-excel',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            xhrFields: {
                responseType: 'blob'
            },
            success: function (response) {
                const blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'view-details.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: function (error) {
                alert('Error generating Excel file');
                console.error('Error:', error);
            }
        });
    });
});