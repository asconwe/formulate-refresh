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

describe('Sign up', () => {
    before((done) => { //Before all tests we empty the database
        User.remove({}, (err) => {
            done();
        });
    });

    describe(`/auth/signup POST`, () => {
        it(`should send fail response when email is is less than 6 characters long`, (done) => {
            chai.request(server)
                .post('/auth/signup')
                .send({ email: "a@c.c", password: 'password' })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.success.should.equal(false);
                    done();
                });
        });

        it(`should send fail response when email doesn't contain @ symbol`, (done) => {
            chai.request(server)
                .post('/auth/signup')
                .send({ email: "asdsaf.gmail.com", password: 'password' })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.success.should.equal(false);
                    done();
                });
        });

        it(`should add a new user if email and password are valid`, (done) => {
            User.find({}, (err, response) => {
                if (err) {
                    (`Couldn't find users`).should.equal('test failed by test error')
                }
                // Save number of users before user is saved
                const priorLength = response.length;

                chai.request(server)
                    .post('/auth/signup')
                    .send(shouldSucceed) 
                    .end((err, res) => {
                        res.should.have.status(200);
                        User.find({}, (err, response) => {
                            priorLength.should.equal(response.length - 1);
                            done();
                        });
                    });
            });
        });

        it(`should send fail response when email is a duplicate`, (done) => {
            chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed) // Will not succeed because it is duplicate email
                .end((err, res) => {
                    res.should.have.status(409);
                    res.body.should.be.a('object');
                    res.body.success.should.equal(false);
                    done();
                });
        });
    });
});
