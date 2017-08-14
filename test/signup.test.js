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

describe('Sign up', () => {
    beforeEach((done) => { //Before each test we empty the database
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

        it(`should send fail response when email is a duplicate`, (done) => {
            const email = 'test@testing.me'
            const testDupUser = new User({ 
                email: email,
                password: 'password'
            })

            testDupUser.save((err) => {
                if (err) {
                    ('message').should.equal('testDupUser did not save');
                }
                
                chai.request(server)
                    .post('/auth/signup')
                    .send({ email: email, password: 'password' })
                    .end((err, res) => {
                        res.should.have.status(409);
                        res.body.should.be.a('object');
                        res.body.success.should.equal(false);
                        done();
                    });
            });
        });

        it(`should send success response if email and password are valid`, (done) => {
            chai.request(server)
                .post('/auth/signup')
                .send(success)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.equal(true);
                    done()
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
                    .send({ email: 'hello@hellooo.com', password: 'password1' })
                    .end((err, res) => {
                        User.find({}, (err, response) => {
                            priorLength.should.equal(response.length - 1);
                            done();
                        });
                    });
            });
        });
    });
});