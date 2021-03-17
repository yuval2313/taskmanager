const request = require('supertest');

const {User} = require('../../../models/user');
const {Task} = require('../../../models/task');

let server;
let endpoint = '/api/tasks';

describe('auth middleware' , () => {
    let user;
    let token;
    let task;

    const exec = () => {
        return request(server)
            .post(endpoint)
            .set('x-auth-token' , token)
            .send(task);
    }

    beforeEach(() => {
        server = require('../../../index');
        token = new User().generateAuthToken();
        task = {
            title: "title1",
            content: "content",
            status: "In Progress",
            priority: "High",
        }
    });

    afterEach( async () => {
        await Task.deleteMany({});
        await server.close();
    });

    it('should return status 401 if no token is provided' , async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return status 400 if an invalid token is provided' , async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });
});