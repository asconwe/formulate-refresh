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

describe('Save a new form', () => {

    let form_id;

    beforeEach((done) => { // Before each tests we empty the database and save a new verified user with a form
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
                    verifiedUser.forms.push(validForm)
                    form_id = verifiedUser.forms[verifiedUser.forms.length]._id.toString();
                    return verifiedUser.save()
                })
                .then(() => {
                    done();
                })
                .catch(err => {
                    console.log('error', err);
                    done();
                });
        });
    });

    // tests
    describe('GET api/edit/form/:form_id', () => {
        it(`should get existing form data, by form_id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login/')
                .send(shouldSucceed)
                .then(() => {
                    return agent
                        .get(`/api/edi/form/${form_id}`);
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.success.should.be.true;
                    return res.body.form.should.deep.equal(validForm);
                })
        });

        it(`should fial if the form_id does not match or is missing`, () => {

        })

        it(`should fail if not logged in`, () => {
            chai.request(server)
                .get(`/api/edit/form/${form_id}`)
                .then(() => res.should.be.undefined)
                .catch(err => {
                    return err.should.have.status(400);
                });
        });
    });
    describe('Post api/edit/form/:form_id', () => {
        it(`It should save only valid new form data to the server and return form _id`, () => {
            const agent = chai.request.agent(server);
            return agent
                .post('/auth/login')
                .send(shouldSucceed)
                .then(() => {

                })
        });

        it(`should fail if not logged in`, () => {
            chai.request(server)
                .post(`/api/edit/form/${form_id}`)
                .then(() => res.should.be.undefined)
                .catch(err => {
                    return err.should.have.status(400);
                });
        });
    });
});