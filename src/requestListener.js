import { v4, validate } from 'uuid';

let users = [];

export const requestListener = (req, res) => {
    const [_, api, resource, id] = req.url.split('/');

    if (api !== 'api' || resource !== 'users') {
        res.writeHead(404, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({error: 'Not Found'}));
    }

    if (req.method === 'GET' && !id) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(users));
    }

    if (req.method === 'GET' && id) {
        if (!validate(id)) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'Invalid UUID'}));
        }

        const user = users.find(user => user.id === id);

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
                users.push(newUser);
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

                const userIndex = users.findIndex(user => user.id === id);

                if (userIndex === -1) {
                    res.writeHead(404, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({error: 'User not found'}));
                }

                users[userIndex] = {id, username, age, hobbies};

                res.writeHead(200, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify(users[userIndex]));
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

        const userIndex = users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            res.writeHead(404, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({error: 'User not found'}));
        }

        users.splice(userIndex, 1);

        res.writeHead(204);
        return res.end();
    }

    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Not Found'}));
}