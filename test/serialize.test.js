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
const success = {
    email: 'success@email.com',
    password: 'sucessPass'
}

chai.use(chaiHttp);

describe('Serialization', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            done();
        });
    });

    describe(`/api/user GET`, () => {
    
        it(`should send a success response if user is signed in`, (done) => {
            chai.request(server)
                .post('/auth/signup')
                .send(success)
                .end((err, res) => {
                    // Login with that new user info
                    chai.request(server)
                        .post('/auth/login')
                        .send(success)
                        .end((err, res) => {
                            chai.request(server)
                                .get('/api/user')
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.success.should.equal(true);
                                    done()
                                });
                        });
                });
        });
    
        it(`should send a fail response if user is not signed in`, (done) => {
            chai.request(server)
                .get('/api/user')
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.success.should.equal(false);
                    done();
                })
        })
    });
});