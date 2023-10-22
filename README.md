# ReVUW
## Website URL
https://revuw.website

## List of Exposed APIs
### Course Routes:
GET /allcourses - Retrieves all courses.
GET /:courseCode - Retrieves details for a specific course based on its code.

### Review Routes:
POST /:courseCode/review - Posts a review for a specific course. 
GET /:courseCode/reviews/:reviewId/edit - Retrieves the edit form for a specific review of a course.
POST /:courseCode/reviews/:reviewId/edit - Updates the review for a specific course.
DELETE /:courseCode/reviews/:reviewId - Deletes a specific review for a course.

### Saved Course Routes:
POST /:courseCode/toggleSavedCourses - Adds or removes a course from a user's saved courses list.
GET /:courseCode/isSavedCourse - Checks if a course is in the user's saved courses list and returns a boolean.
GET /allSavedCourses - Retrieves all saved courses for a user.

### Password Reset Routes:
GET /reset-password/:token - Accesses the password reset page using a specific token.
GET /reset-password - Displays the password reset page.
POST /reset-password - Processes the password reset request and updates the user's password.
POST /request-password-reset - Sends a password reset email to the user.

### Profile Route:
GET /profile - Retrieves the profile data of the logged-in user.

### Signup Routes:
GET /signup - Displays the user registration page.
POST /signup - Processes the user registration request.

### Signin Routes:
GET /signin - Displays the user login page.
POST /signin - Processes the user login request.

### Logout Route:
POST /logout - Logs out the currently logged-in user.

### Google OAuth Routes:
GET /google - Initiates the Google OAuth authentication process.
GET /google/callback - Handles the callback from Google OAuth and processes the user authentication.

## Fault Tolerance/ Error Handling

## Test Scripts

## Summary of Database Design

# Postman Requests for testing the response time of each exposed API under varied workload
For this project, we are defining two categories for the workload:
1. Low workload - 2 tests per request
2. Moderate workload - 4 tests per request

For the low workload of each API, we are sending a GET request with the first two tests under the ***General GET requests for each exposed API*** section.
For the moderate workload of each API, we are sending a GET request with all the three tests under the ***General GET requests for each exposed API*** section, along with the test under ***Specific GET request test scripts for each exposed API*** section. 

## General GET request test scripts for each exposed API
```txt
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Content-Type is present", function () {
    pm.expect(pm.response.headers.get('Content-Type')).to.eql('text/html; charset=utf-8');
});
```

## Specific GET request test scripts for each exposed API (executed along with the general tests above)
## Root route - https://revuw.website/
```txt
pm.test("Body matches string", function () {
    pm.expect(pm.response.text()).to.include("We're dedicated to empowering students");
});
```

## All courses route - https://revuw.website/courses/allcourses
```txt
pm.test("Body matches string", function () {
    pm.expect(pm.response.text()).to.include("ReVUW | Courses");
});
```
## Course route - https://revuw.website/courses/:courseCode (e.g., https://revuw.website/courses/SWEN303)
```txt
pm.test("Body matches string", function () {
    pm.expect(pm.response.text()).to.include("Total Reviews");
});
```

## Auth route - https://revuw.website/auth/signin
```txt 
pm.test("Body matches string", function () {
    pm.expect(pm.response.text()).to.include("Forgot Password?");
});
```
# Response Times

## Low Workload
1. Root route
    - Response time:  456 ms
1. All courses route
    - Response time:  253 ms
1. Course route
    - Response time:  285 ms
1. Auth route
    - Response time:  268 ms

## Moderate Workload
1. Root route
    - Response time:  465 ms
1. All courses route
    - Response time:  268 ms
1. Course route
    - Response time:  299 ms
1. Auth route
    - Response time:  294 ms
