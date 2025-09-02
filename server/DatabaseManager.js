// server/DatabaseManager.js
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'helios.db');

export class DatabaseManager {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error("Error opening database", err.message);
            } else {
                console.log("Database connected.");
                this.db.run(`CREATE TABLE IF NOT EXISTS api_keys (
                    provider TEXT PRIMARY KEY,
                    api_key TEXT NOT NULL,
                    api_secret TEXT
                )`);
            }
        });
    }

    // Promisify db.get
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Promisify db.run
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async saveApiKey(provider, encryptedKey, encryptedSecret) {
        const sql = `INSERT OR REPLACE INTO api_keys (provider, api_key, api_secret) VALUES (?, ?, ?)`;
        return await this.run(sql, [provider, encryptedKey, encryptedSecret]);
    }

    async getApiKey(provider) {
        const sql = `SELECT api_key, api_secret FROM api_keys WHERE provider = ?`;
        return await this.get(sql, [provider]);
    }
}
