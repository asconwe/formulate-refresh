//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const User = require('../../../../models/User');

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../../server');
const should = chai.should();
chai.use(chaiHttp);

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

describe('Get user data', () => {
    before((done) => { //Before all tests we empty the database
        User.remove({}, (err) => {
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then(() => {
                    done();
                })
                .catch(err => {
                    console.log('Error in test setup::', err);
                    done();
                });
        });
    });

    // tests
    describe('GET /api/user', () => {

        it(`should fail if not logged in`, () => {
            chai.request(server)
                .get('/api/user')
                .then(res => {
                    return res.body.success.should.be.false
                })
                .catch((err) => {
                    return err.should.have.status(400);
                })
        })

        it(`should send 'please verify' message if logged in but not verified`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(res => {
                    return agent
                        .get('/api/user')
                })
                .then(res => {
                    res.should.have.status(209);
                    res.body.success.should.be.true;
                    res.body.verified.should.be.false;
                    res.body.should.not.have.own.property('forms');
                    return res.body.message.should.equal(`Check your ${shouldSucceed.email} inbox for our verification email.`)
                })
        });

        it(`should get user information to populate dashboard, if the user is verified`, () => {
            const agent = chai.request.agent(server);
            User.find({})
                .then(user => {
                    const verifiedUser = user[0];
                    verifiedUser.verified = true;
                    return verifiedUser.save();
                })
                .catch((err) => {
                    console.log('failed to manually verify user in testcase set up::', err)
                    return err.should.be.undefined;
                })
                .then(() => {
                    return agent
                        .post('/auth/login')
                        .send(shouldSucceed)
                })
                .then(() => {
                    return agent
                        .get('/api/user')
                })
                .then(res => {
                    res.should.have.status(209);
                    res.body.success.should.be.true;
                    res.body.forms.should.be.an('array');
                    return res.body.should.have.own.property('_id');
                });
        });
    });
});