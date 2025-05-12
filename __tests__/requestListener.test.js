import {jest} from '@jest/globals';
import {requestListener} from "../src/requestListener.js";
import db from "../src/db.js";

describe('test request listener' , () => {
    beforeAll(() => {
        db.clear();
    });

    test('GET /api/users should return empty array', () => {
        const req = {method: 'GET', url: '/api/users'};
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        requestListener(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(200, {'Content-Type': 'application/json'});
        expect(res.end).toHaveBeenCalledWith(JSON.stringify([]));
    });

    let postedUser = {};
    test('POST /api/users should create a new user', () => {
        const username = 'some wonderfull user';
        const req = {
            method: 'POST',
            url: '/api/users',
            on: jest.fn((event, callback) => {
                if (event === 'data') {
                    callback(JSON.stringify({username: username, age: 25, hobbies: ['reading', 'skiing']}));
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        const res = {
            writeHead: jest.fn(),
            end: jest.fn((data) => {
                res.body = data;
            }),
        };
        requestListener(req, res);
        postedUser = JSON.parse(res.body);

        expect(res.writeHead).toHaveBeenCalledWith(201, {'Content-Type': 'application/json'});
        expect(res.end).toHaveBeenCalledWith(expect.stringContaining(`"username":"${username}"`));
    });

    test('GET /api/users/:id should return user by id', () => {
        const req = {method: 'GET', url: `/api/users/${postedUser.id}`};
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        requestListener(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(200, {'Content-Type': 'application/json'});
        expect(res.end).toHaveBeenCalledWith(JSON.stringify(postedUser));
    });

    test('PUT /api/users/:id should update user by id', () => {
        const user = 'other wonderfull user';
        const req = {
            method: 'PUT',
            url: `/api/users/${postedUser.id}`,
            on: jest.fn((event, callback) => {
                if (event === 'data') {
                    callback(JSON.stringify({username: user, age: 30, hobbies: ['reading', 'skiing']}));
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        requestListener(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(200, {'Content-Type': 'application/json'});
        expect(res.end).toHaveBeenCalledWith(expect.stringContaining(`"username":"${user}"`));
    });

    test('DELETE /api/users/:id should delete user by id', () => {
        const req = {method: 'DELETE', url: `/api/users/${postedUser.id}`};
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        requestListener(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(204);
    });

    test('GET /api/users/:id should return 404 for deleted user', () => {
        const req = {method: 'GET', url: `/api/users/${postedUser.id}`};
        const res = {
            writeHead: jest.fn(),
            end: jest.fn(),
        };
        requestListener(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(404, {'Content-Type': 'application/json'});
        expect(res.end).toHaveBeenCalledWith(expect.stringContaining('User not found'));
    });
})