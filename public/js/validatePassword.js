document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('passwordInput').addEventListener('keyup', function() {
        console.log('keypress');
        const passwordValue = this.value;
        const feedback = checkPasswordStrength(passwordValue);
    
        const feedbackElement = document.getElementById('passwordFeedback');
        if (feedback) {
        feedbackElement.textContent = feedback;
        feedbackElement.style.color = 'red';
        } else {
        feedbackElement.textContent = 'Password looks strong!';
        feedbackElement.style.color = 'green';
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