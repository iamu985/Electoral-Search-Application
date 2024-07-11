$(document).ready(function () {
    $('#evaluationForm').submit(function (event) {
        event.preventDefault();

        const formData = collectFormData();
        // console.log(formData); // Debugging - see the collected data object
        $.ajax({
            url: '/evaluation', // Change to your endpoint
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

    function collectFormData() {
        const form = $('#evaluationForm');
        const rolePlay = {
            organization: form.find('[name="organization"]').val(),
            working_area: form.find('[name="working_area"]').val(),
            concern_association: form.find('[name="concern_association"]').val(),
            regular_manner: form.find('[name="regular_manner"]').val()
        };

        const questions = [];
        for (var i = 1; i <= 6; i++) {
            questions.push({
                question: $(`#eval-ques-${i}`).text(),
                answer: form.find(`[name="eval-ques-${i}"]`).val()
            })
        }

        const compilersNote = form.find('[name="compilers_note"]').val();

        return {
            evaluation: {
                role_play: rolePlay,
                questions: questions,
                compilers_note: compilersNote
            }
        };
    }
});