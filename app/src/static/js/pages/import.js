$(document).ready(function () {

    function getSuccessNotification(ids) {
        let idList = ids.map(id => `<li>${id}</li>`).join('');
        return `
        <div class="alert alert-success">
            <div class="message">Data imported successfully.</div>
            <div class="created-ids">
                <ul>${idList}</ul>
            </div>
        </div>
        `;
    }

    $('#importBtn').click(function () {
        const formData = new FormData($('#importForm')[0]);

        $.ajax({
            url: '/import',
            method: 'POST',
            enctype: 'multipart/form-data',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    $('#importStatus').html(getSuccessNotification(response.id));
                } else {
                    $('#importStatus').html(`<div class="alert alert-danger">Error importing data: ${response.message}</div>`);
                }
            },
            error: function (err) {
                $('#importStatus').html(`<div class="alert alert-danger">Error: ${err.responseText}</div>`);
            }
        });
    });
});