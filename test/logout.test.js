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

describe('Logout', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            done();
        });
    });

    describe(`/auth/logout GET`, () => {
        it(`should log user out, and prevent access to forms`, (done) => {
            // Sign up a new user
            chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .end((err, res1) => {
                    // Login with that new user info
                    const agent = chai.request.agent(server);
                    return agent
                        .post('/auth/login')
                        .send(shouldSucceed)
                        .end((err, res2) => {
                            res2.should.have.cookie('session')
                            return agent
                                .get('/api/user')
                                .end((err, res3) => {
                                    res3.should.have.status(200);
                                    res3.body.success.should.equal(true);
                                    return agent
                                        .get('/auth/logout')
                                        .end((err, res4) => {
                                            return agent
                                                .get('/api/user')
                                                .end((err, res5) => {
                                                    res5.should.have.status(400);
                                                    done()
                                                });
                                        });
                                });
                        });
                });
        })
    });
});