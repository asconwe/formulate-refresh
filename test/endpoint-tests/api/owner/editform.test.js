//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let User = require('../../../../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../../server');
let should = chai.should();

chai.use(chaiHttp);

// User data that should succeed in signup and signin
const shouldSucceed = {
    email: 'success@email.com',
    password: 'sucessPass'
}

const validForm = {
    title: 'My form',
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

describe('Edit a form', () => {

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

    describe('GET api/edit/form/:form_id', () => {
        it(`should get existing form data, by form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .get(`/api/edit/form/${form_id}`);
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.success.should.be.true;
                    return new Promise((resolve, reject) => {
                        User.find({}, (err, users) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve({ user: users[0], res });
                        })
                    })
                })
                .then(({user, res}) => {
                    const form = user.forms[0];
                    form.title.should.equal(validForm.title);
                    res.body.form.topLevelElements[0].children[0].type.should.equal(form.topLevelElements[0].children[0].type)
                    return res.body.form.title.should.equal(validForm.title);
                })
                .catch(err => {
                    console.trace('Err -- ths should not be entered');
                })
        });

        it(`should fail if the form_id does not match or is missing`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .get(`/api/edit/form/`);
                })
                .catch(err => {
                    err.should.have.status(404);
                    return null;
                })
                .then(() => {
                    return agent
                    .get(`/api/edit/form/invalidid`)
                })
                .catch(err => {
                    err.should.have.status(400);
                })
        })

        it(`should fail if not logged in`, () => {
            chai.request(server)
                .get(`/api/edit/form/${form_id}`)
                .then(res => res.should.be.undefined)
                .catch(err => {
                    return err.should.have.status(400);
                });
        });
    });

    describe('Post api/edit/form/:form_id', () => {
        it(`It should save valid form data to the server and return form _id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(() => {
                    const updatedForm = Object.assign({}, validForm, { title: 'Edited' });
                    return agent
                        .post(`/api/edit/form/${form_id}`)
                        .send({ form: updatedForm })
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.success.should.be.true;
                    return User.find({})
                })
                .then(users => {
                    users[0].forms[0].title.should.equal('Edited');
                    return users[0].forms[0].topLevelElements[0].children[0].type.should.equal(validForm.topLevelElements[0].children[0].type);
                })
                .catch(err => {
                    return err.should.be.undefined;
                })
        });

        it(`should fail if form data is invalid`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .post(`/api/edit/form/${form_id}`)
                        .send({ invalidKey: 'something' });
                })
                .then(res => res.should.be.undefined)
                .catch(err => {
                    err.should.have.status(400);
                    err.response.res.body.should.have.property('cause');
                })

        })
        
        it(`should fail if form_id is invalid`, () => {
            const agent = chai.request.agent(server);
            return agent
            .post('/auth/login/')
            .send(shouldSucceed)
            .then(() => {
                return agent
                .post(`/api/edit/form/asdf`)
                .send(validForm);
            })
            .catch(err => err.should.have.status(400));
        })
        
        it(`should fail if not logged in`, () => {
            chai.request(server)
            .post(`/api/edit/form/${form_id}`)
            .send(validForm)
            .then(() => res.should.be.undefined)
            .catch(err => {
                return err.should.have.status(400);
            });
        })
    });

});