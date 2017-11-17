//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const User = require('../../models/User');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

chai.use(chaiHttp);

describe('Login', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            if (err) console.trace(err.message);
            chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then(res => {
                    done();
                })
                .catch(err => {
                    console.trace('error in login setup');
                    done();
                });    
        })
    });

    describe(`/auth/login POST`, () => {

        it(`should send a fail response if email is incorrect`, () => {
            return chai.request(server)
                .post('/auth/login')
                .send({ email: 'incorrect@email.com', password: 'password' })
                .then((res) => {
                    res.should.not.be.ok;
                })
                .catch(err => {
                    err.should.have.status(400);
                    return err.should.not.have.cookie('session');
                });
        });

        it(`should send a fail response if password is incorrect`, () => {
            return chai.request(server)
                .post('/auth/login')
                .send({ email: shouldSucceed.email, password: 'blahblahblah' })
                .then(res => res.should.not.be.ok)
                .catch(err => {
                    return err.should.have.status(400);
                });
        });

        it(`should send a success response if password and email are both correct`, () => {
            // Login with that new user info
            const agent = chai.request(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(res => {
                    res.should.have.status(200);
                    res.should.have.cookie('session');
                    return res.body.success.should.be.true;
                })
                .catch(err => err.should.be.undefined);
        });
    });
});