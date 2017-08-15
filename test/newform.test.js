// Describe POST api/new/form

// It should fail if user is not logged in
// -          Res should have a status of 400
// -          Res body success should equal false
// It should save new form data to the server and return form _id
// -          Res should have a status of 200
// -          Res body success should equal true
// -          Res body should have own property _id
// -          Res user forms length should equal User forms length – 1

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

describe('Save a new form', () => {
    before((done) => { //Before all tests we empty the database
        User.remove({}, (err) => {
            chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .end((err, res) => {
                    if (err) console.log('could not create user account for test');
                    done();
                })
        });
    });

    // tests
    describe('POST api/new/form', () => {
        it(`should get user information to populate dashboard`, (done) => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .end((err, res) => {
                    return agent
                        .get('/api/user')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.success.should.be.true;
                            res.body.forms.should.be.an('array');
                            res.body.should.have.own.property('_id')
                        });
                });
        });
        
        it(`should fail if not logged in`, (done) => {
            chai.request(server)
                .get('/api/user')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.success.should.not.be.true;
                    res.body.should.not.have.own.property('forms');
                    res.body.should.not.have.own.property('_id');
                })
        })
    });
});