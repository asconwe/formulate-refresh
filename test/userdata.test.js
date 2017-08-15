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
            chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .end((err, res) => {
                    done();
                })
        });
    });

    // tests
    describe('GET /api/user', () => {
        
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
        
        it(`should send 'please verify' message if logged in but not verified`, (done) => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .end((err, res) => {
                    return agent
                        .get('/api/user')
                        .end((err, res) => {
                            res.should.have.status(209);
                            res.body.success.should.not.be.true;
                            res.body.should.not.have.own.property('forms');
                            res.body.should.have.own.property('_id');
                            res.body.should.email.should.equal(shouldSucceed.email);
                            res.body.message.should.equal(`Check your ${res.body.email} inbox for our verification message`)
                        });
                });
        });
        
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
    });
});