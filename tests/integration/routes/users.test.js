const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');

const {User} = require('../../../models/user');

let server;
let endpoint = '/api/users'

describe(endpoint , () => {

    let user;

    beforeEach(() => {
        server = require('../../../index');
    });

    afterEach( async () => {
        await User.deleteMany({});
        await server.close();
    });
    describe('POST /' , () => {
        beforeEach(() => {
            user = {
                name: "name",
                email: "email@email.com",
                password: "Aa12345678"
            };
        });

        const exec = () => {
            return request(server)
                .post(endpoint)
                .send(user)
        } 

        it('should return status 400 if name is less than 3 characters' , async () => {
            user.name = "aa";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if name is more than 50 characters' , async () => {
            user.name = new Array(52).join('a');    

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if email is less than 3 characters' , async () => {
            user.email = '@1.';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if email is more than 50 characters' , async () => {
            const fortyOneChar = new Array(42).join('a');
            user.email = fortyOneChar + '@email.com';

            const res = await exec();

            expect(res.status).toBe(400);   
        });

        it('should return status 400 if invalid email is given' , async () => {
            user.email = 'email.com';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password is less than 8 characters' , async () => {
            user.password = 'aA12345';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password is more than 50 characters' , async () => {
            const fortyOneChar = new Array(42).join('a');
            user.password = fortyOneChar + 'aA12345678'

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password doesn\'t contain any numbers' , async () => {
            user.password = 'AbcdefghijK';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password doesn\'t contain any uppercase letters' , async () => {
            user.password = 'a12345678';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if password doesn\'t contain any lowercase letters' , async () => {
            user.password = 'A12345678';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if user has already registered' , async () => {
            await new User(user).save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the given user to the database' , async () => {
            await exec();

            const dbUser = await User.findOne({name: user.name, email: user.email});

            expect(dbUser).not.toBeNull();
        });

        it('should save the given user to the database with a hashed password' , async () => {
            await exec();

            const dbUser = await User.findOne({name: user.name, email: user.email});
            
            expect(async () => { await bcrypt.compare(user.password , dbUser.password) }).toBeTruthy();
        });

        it('should return status 200 if valid request' , async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
        })

        it('should return the JWT in the response header' , async () => {
            const res = await exec();
            
            expect(res.header).toHaveProperty('x-auth-token');
        });

        it('should return the new user to the client' , async () => {
            const res = await exec();

            expect(res.body).toMatchObject({name: user.name , email: user.email});
        })
    });

    describe('GET /me' , () => {

        let token;

        const exec = () => {
            return request(server)
                .get(endpoint+'/me')
                .set('x-auth-token' , token)
        }

        beforeEach(async () => {
            user = new User({
                name: "name",
                email: "email@email.com",
                password: "Aa12345678"
            });
            token = user.generateAuthToken();
            await user.save()
        });

        it('should return status 401 if no token is provided' , async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        }); 

        it('should return status 400 if invalid token is provided' , async () => {
            token = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 200 if valid request' , async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should return the user based on the payload of the given token' , async () => {
            const decoded = jwt.verify(token , config.get('jwtPrivateKey'));
            delete decoded.iat;
            
            const res = await exec();

            expect(res.body).toEqual(expect.objectContaining(decoded));
        });
    });
});