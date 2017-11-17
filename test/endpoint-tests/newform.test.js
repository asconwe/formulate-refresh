//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let User = require('../../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();

chai.use(chaiHttp);

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

const validForm = {
    title: 'My form',
    published: false,
    topLevelElements: [
        {
            type: 'box',
            options: {
                width: 12,
            },
            children: [
                {
                    type: 'text-box',
                    options: {
                        width: 12
                    }
                }
            ]
        }
    ]
}

const invalidForm = {
    title: { title: 'My invalid form title' },
    invalidProp: 'it dont work!'
}

describe('Create a new form', () => {
    beforeEach((done) => { //Before each tests we empty the database
        User.remove({}, (err) => {
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then(() => {
                    return User.find({}).exec()
                })
                .then(user => {
                    const verifiedUser = user[0];
                    verifiedUser.verified = true;
                    return verifiedUser.save()
                })
                .then(() => {
                    done();
                })
                .catch(err => {
                    console.log('error in odd spot')
                    done();
                });
        });
    });

    // tests
    describe('POST api/new/form', () => {
        it(`It should save only valid new form data to the server and return form _id`, () => {
            const agent = chai.request.agent(server);
            let thenEntered = false;
            let thenNotEntered = true;
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post('/api/new/form')
                        .send({ form: validForm }) // test with a valid form
                })
                .then(res => {
                    thenEntered = true; // Make sure these tests are passed (thenEntered is tested against later)
                    res.should.have.status(200);
                    res.body.success.should.be.true;
                    res.body._id.should.be.a('string');
                    console.log('first request')
                    return agent
                        .post('/api/new/form')
                        .send({ form: invalidForm }) // test with an invalid form
                })
                .then(res => {
                    thenNotEntered = false;
                    console.log('second request')
                    throw { message: 'this callback should not be entered'}
                })
                .catch(err => {
                    thenEntered.should.be.true;
                    thenNotEntered.should.be.true;
                    err.response.should.have.status(400);
                    err.response.res.body.success.should.be.false;
                    
                    return User.find({}, (err, user) => {
                        user[0].forms.length.should.equal(1);
                        user[0].forms[0].title.should.equal(validForm.title);
                        console.log(user[0].forms[0].topLevelElements);
                        user[0].forms[0]
                            .topLevelElements[0]
                            .children[0].type.should.
                            equal(validForm.topLevelElements[0].children[0].type);
                    })
                })
        });
        
        it(`should fail if not logged in`, () => {
            chai.request(server)
                .get('/api/user')
                .then(() => res.should.be.undefined)
                .catch(err => {
                    return err.should.have.status(400);
                });
        });
    });
});