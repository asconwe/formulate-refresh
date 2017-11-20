//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();

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

chai.use(chaiHttp);

describe('Publish form', () => {
    let form_id;
    
    // Before all tests we empty the database and save a new verified user with a form
    before((done) => { 
        User.remove({}, (err) => {
            if (err) console.log(err);
            return chai.request(server)
                .post('/auth/signup')
                .send(shouldSucceed)
                .then((res) => {
                    return User.find({})
                })
                .catch(err => console.log(err))
                .then(users => {
                    const verifiedUser = users[0];
                    verifiedUser.verified = true; // mock user verification
                    verifiedUser.forms.push(validForm)
                    form_id = verifiedUser.forms[0]._id.toString();
                    return verifiedUser.save()
                })
                .then((user) => {
                    return done();
                })
                .catch(err => {
                    console.log('ERR in edit form setup!!', err)
                    return done();
                });
        });
    });

    describe(`/api/publish/form/:form_id POST`, () => {
        it(`should set the form's published status to true given a valid form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post(`/api/publish/form/${form_id}`)
                        .send({ published: true });
                })
                .then((res) => {
                    res.should.have.status(200)
                    return User.findOne({})
                })
                .then((user) => {
                    return user.forms[0].published.should.be.true;
                })
                .catch(err => {
                    console.error(err);
                    err.should.be.undefined;
                })
        });
        
        it(`should fail given an invalid form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post(`/api/publish/form/abcd`)
                        .send({ published: true });
                })
                .then((res) => {
                    res.should.have.status(400);
                })
                .catch(err => {
                    err.should.have.status(400);
                })
        })
    });
    
    describe(`/api/unpublish/form/:form_id POST`, () => {
        it(`should set the form's published status to false given a valid form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post(`/api/unpublish/form/${form_id}`)
                        .send({ published: false });
                })
                .then((res) => {
                    res.should.have.status(200)
                    return User.findOne({})
                })
                .then((user) => {
                    return user.forms[0].published.should.be.false;
                })
                .catch(err => {
                    console.error(err);
                    err.should.be.undefined;
                })
        });
    
        it(`should fail given an invalid form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post(`/api/unpublish/form/abcd`)
                        .send({ published: true });
                })
                .then((res) => {
                    res.should.have.status(400);
                })
                .catch(err => {
                    err.should.have.status(400);
                })
        })
    });
});