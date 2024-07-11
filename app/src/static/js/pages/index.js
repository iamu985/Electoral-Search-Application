$(document).ready(function () {
    $('#generatDummyData').click(function (e) {
        e.preventDefault();
        $.ajax({
            url: '/generate-dummy',
            method: 'GET',
            success: function (response) {
                if (response.success) {
                    alert(`Dummy data generated successfully.`);
                } else {
                    alert(`There was some errors generating data. Errors: ${response.errors}`);
                }
            },
            error: function (err) {
                alert(`Received Errors: ${err}`);
            }
        })
    })

    $('.f-card').hover(
        function () {
            $(this).find('.f-icon').css({
                'transform': 'rotate(10deg)',
                'transition': 'transform 0.3s ease'
            });
        },
        function () {
            $(this).find('.f-icon').css('transform', 'rotate(0deg)');
        }
    );
})