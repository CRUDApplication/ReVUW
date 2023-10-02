document.addEventListener("DOMContentLoaded", function() {
    const eyeIcon = document.querySelector('#togglePassword i');

    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('passwordInput');
        // Toggle between showing and hiding the password
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove('fas', 'fa-eye');
            eyeIcon.classList.add('fas', 'fa-eye-slash');
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove('fas', 'fa-eye-slash');
            eyeIcon.classList.add('fas', 'fa-eye');
        }
    });
    document.getElementById('passwordInput').addEventListener('keyup', function() {
        const feedbackElement = document.getElementById('passwordFeedback');
        const password = this.value;
        const errorMessage = checkPasswordStrength(password);

        if (errorMessage) {
            feedbackElement.textContent = errorMessage;
        } else {
            feedbackElement.textContent = "";
        }
    });
});
function checkPasswordStrength(userPassword) {
    let errorMessage = null;
    if (userPassword.length < 8) {
      errorMessage = 'Use 8 characters or more for your password';
    } else if (!/(?=.*[a-z])/.test(userPassword) || !/(?=.*[A-Z])/.test(userPassword) || !/[0-9]/.test(userPassword)) {
      errorMessage = 'Please choose a stronger password. Use a mix of numbers and letters with upper and lower case';
    } 
    return errorMessage;
}