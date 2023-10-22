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
