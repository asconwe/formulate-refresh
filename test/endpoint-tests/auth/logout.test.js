//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let User = require('../../../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../server');
let should = chai.should();

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

chai.use(chaiHttp);

describe('Logout', () => {
    before((done) => { //Before all tests we empty the database and sign up/verify one new user
        User.remove({}, (err) => {
            if (err) console.trace(err.message);
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then(() => {
                    return User.find({})
                })
                .then(user => {
                    const verifiedUser = user[0];
                    verifiedUser.verified = true;
                    return verifiedUser.save();
                })
                .then(() => {
                    done();
                })
                .catch(err => {
                    console.trace(err.message)
                    done();
                });
        });
    });

    describe(`/auth/logout GET`, () => {
        it(`should log user out, and prevent access to forms`, () => {
            // Sign up a new user
            let agent = chai.request.agent(server);
            let didLogIn = false;
            let didSendLogOutRequest = false;
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(res => {
                    res.should.have.cookie('session')
                    return agent
                        .get('/api/user')
                })
                .then(res => {
                    didLogIn = true;
                    res.should.have.status(200);
                    res.body.success.should.equal(true);
                    return agent
                        .get('/auth/logout')
                })
                .then(res => {
                    didSendLogOutRequest = true;
                    res.should.have.status(200);
                    return agent
                        .get('/api/user')
                })
                .then(res => {
                    res.should.be.undefined;
                })
                .catch(err => {
                    didLogIn.should.be.true;
                    didSendLogOutRequest.should.be.true;
                    return err.should.have.status(400);
                })
        })
    });
});