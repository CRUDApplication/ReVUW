const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const initialiseDatabase = require('../utils/database');

initialiseDatabase();

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'courses.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
const coursesProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

const CourseModel = require('../models/course');

server.addService(coursesProto.courses.CourseService.service, {
    GetCourse: async (call, callback) => {
        try {
            let course = await CourseModel.findOne({ courseCode: call.request.courseCode })
            if (!course) {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: 'Course not found'
                });
            } else {
                callback(null, course);
            }
        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: 'Failed to retrieve course'
            });
        }
    },
    GetAllCourses: async (call, callback) => {
        try {
            let courses = await CourseModel.find();
            callback(null, { courses });
        } catch (err) {
            callback({
                code: grpc.status.INTERNAL,
                details: 'Failed to retrieve all courses'
            });
        }
    }
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(`Failed to bind server on port 50051: ${err.message}`);
    } else {
        console.log('gRPC server running on port:', port);
        server.start();
    }
});
