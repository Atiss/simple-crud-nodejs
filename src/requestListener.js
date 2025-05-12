import { v4, validate } from 'uuid';
import db from './db.js';

export const requestListener = (req, res) => {
    const [_, api, resource, id] = req.url.split('/');

    db.reloadData();

    if (api !== 'api' || resource !== 'users') {
        res.writeHead(404, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({error: 'Not Found'}));
    }

    if (req.method === 'GET' && !id) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(db.getUsers()));
    }

    if (req.method === 'GET' && id) {
        if (!validate(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'Invalid UUID'}));
        }

        const user = db.getUserById(id);

        if (!user) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'User not found'}));
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(user));
    }

    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const {username, age, hobbies} = JSON.parse(body);
                if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({error: 'Invalid request body'}));
                }
                const newUser = {
                    id: v4(),
                    username,
                    age,
                    hobbies
                };
                db.addUser(newUser);
                res.writeHead(201, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify(newUser));
            } catch (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify({error: 'Internal Server Error'}));
            }
        });
        return;
    }

    if (req.method === 'PUT' && id) {
        if (!validate(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'Invalid UUID'}));
        }

        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const {username, age, hobbies} = JSON.parse(body);

                if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({error: 'Invalid request body'}));
                }

                const userIndex = db.findIndex(id);

                if (userIndex === -1) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({error: 'User not found'}));
                }

                const newUser = {id, username, age, hobbies};
                db.updateUser(id, newUser);

                res.writeHead(200, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify(newUser));
            } catch (err) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify({error: 'Internal Server Error'}));
            }
        });
        return;
    }

    if (req.method === 'DELETE' && id) {
        if (!validate(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'Invalid UUID'}));
        }

        const userIndex = db.findIndex(id);

        if (userIndex === -1) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'User not found'}));
        }

        db.deleteUser(id);

        res.writeHead(204);
        return res.end();
    }

    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Not Found'}));
}