import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DB_FILE = resolve('db.json');

class Database {
    constructor() {
        this.users = this.loadData();
    }

    loadData() {
        if (existsSync(DB_FILE)) {
            try {
                const data = readFileSync(DB_FILE, 'utf-8');
                return JSON.parse(data);
            } catch (error) {
                console.error('Error reading database file:', error);
                return [];
            }
        }
        return [];
    }

    reloadData() {
        this.users = this.loadData();
    }

    saveData() {
        try {
            writeFileSync(DB_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error writing to database file:', error);
        }
    }

    getUsers() {
        return this.users;
    }

    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    addUser(user) {
        this.users.push(user);
        this.saveData();
    }

    findIndex(id) {
        return this.users.findIndex(user => user.id === id);
    }

    updateUser(id, updatedUser) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            this.saveData();
        }
    }

    deleteUser(id) {
        this.users = this.users.filter(user => user.id !== id);
        this.saveData();
    }

    clear() {
        this.users = [];
        this.saveData();
    }
}

const db = new Database();
export default db;