// Describe GET api/user
// It should fail if user is not logged in
// -          Res should have a status of 400
// -          Res body success should equal false
// -          Res should not have own property user
// It should get user information to populate dashboard
// -          Res should have a status of 200
// -          Res body success should equal true
// -          Res should have own property user

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

chai.use(chaiHttp);

describe('Get user data', () => {
    before((done) => { //Before all tests we empty the database
        User.remove({}, (err) => {
            done();
        });
    });

    // tests
    Describe('GET /api/user', () => {
        it(`should fail if the user is not logged in`, (done) => {

        })
    });
});