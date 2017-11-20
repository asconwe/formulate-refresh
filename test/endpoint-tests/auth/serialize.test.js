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

describe('Serialization', () => {
    before((done) => { //Before all tests we empty the database, sign-up one new user, and verify them
        User.remove({}, (err) => {
            if (err) console.log(err);
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then(() => {
                    return User.find({}).exec();
                })
                .then(user => {
                    const verifiedUser = user[0];
                    verifiedUser.verified = true;
                    verifiedUser.save();
                    done();
                })
                .catch(err => {
                    console.trace('error in serialize setup', err);
                    done();
                });
        });
    });

    describe(`serialize /api/user GET`, () => {
        it(`should send a success response if user is signed in`, () => {
            // Login with that new user info
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(res => {
                    res.should.have.cookie('session')
                    return agent
                        .get('/api/user')
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.success.should.be.true;
                    res.body.verified.should.be.true;
                    return res.body.should.have.property('forms');
                })
                .catch(err => {
                    console.trace(err)
                    err.should.be.undefined
                });
        });

        it(`should send a fail response if user is not signed in`, () => {
            return chai.request(server)
                .get('/api/user')
                .then(res => res.should.be.undefined)
                .catch(err => err.should.have.status(400));
        });
    });
});