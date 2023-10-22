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
