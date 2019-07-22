const successfulResponse = require('../tools/successfulResponse');
const erroredResponse = require('../tools/erroredResponse');
const {post} = require('../tools/request');
const {assert} = require('chai');
const faker = require('faker');

describe('Authentication', () => {
    let password = faker.internet.password();
    let username = faker.name.firstName().slice(0, 10);
    let apikey;

    // Register a new user
    it('/register', done => {
        post('/register')
            .send({username, password})
            .expect(200)
            .then(successfulResponse)
            .then(() => done());
    });

    // Login
    it('/login', done => {
        post('/login')
            .send({username, password})
            .expect(200)
            .then(successfulResponse)
            .then(data => {
                assert.isString(apikey = data.apikey);
                done();
            });
    });

    // Check apikey
    it('/checkApiKey', done => {
        post('/checkApiKey')
            .send({apikey})
            .expect(200)
            .then(successfulResponse)
            .then(data => {
                assert.isTrue(data);
                done();
            });
    });

    // Change credentials
    it('/updateCredentials', done => {
        post('/updateCredentials')
            .send({
                apikey,
                currentPassword: password,
                newUsername: username = faker.name.firstName().slice(0, 10),
                newPassword: password = faker.internet.password()
            })
            .then(successfulResponse)
            .then(() => done());
    });

    // Pull status
    it('/status', done => {
        post('/status')
            .send({apikey})
            .then(successfulResponse)
            .then(({user}) => {
                assert.strictEqual(user.username, username);
                done();
            });
    });
});
