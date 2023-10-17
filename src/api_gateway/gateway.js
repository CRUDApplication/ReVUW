const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'courses.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const coursesProto = grpc.loadPackageDefinition(packageDefinition);

const client = new coursesProto.courses.CourseService('localhost:50051', grpc.credentials.createInsecure());

const app = express();

app.get('/course/:courseCode', (req, res) => {
    client.GetCourse({ courseCode: req.params.courseCode }, (error, response) => {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).json(error);
        }
    });
});

app.get('/allcourses', (req, res) => {
    client.GetAllCourses(null, (error, response) => {
        if (!error) {
            res.json(response.courses);
        } else {
            res.status(500).json(error);
        }
    });
});

app.listen(3001, () => {
    console.log('API Gateway running on port:', '3001');
});
