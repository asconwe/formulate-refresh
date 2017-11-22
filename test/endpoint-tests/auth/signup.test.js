//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const User = require('../../../models/User');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const should = chai.should();

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

chai.use(chaiHttp);

describe('Sign up', () => {
    before((done) => { //Before all tests we empty the database
        User.remove({}, (err) => {
            if (err) console.log(err);
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

        it(`should add a new user and send verification email if email and password are valid`, () => {
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed) 
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('verificationSent');
                    return User.find({}).exec();
                })
                .then(users => {
                    return users.length.should.equal(1);
                })
                
        });

        it(`should send fail response when email is a duplicate`, () => {
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed) // Will not succeed because it is duplicate email
                .then(res => res.should.be.undefined)
                .catch(res => res.should.have.status(409));
        });
    });
});
