// server/HeliosMemory.js
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'helios.db');

export class HeliosMemory {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error("Error opening database", err.message);
            } else {
                console.log("HeliosMemory database connected.");
                this._initializeTables();
            }
        });
    }

    _initializeTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS api_keys (
                provider TEXT PRIMARY KEY,
                api_key TEXT NOT NULL,
                api_secret TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS event_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT
            )`
        ];
        tables.forEach(sql => this.db.run(sql));
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
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

    async setConfig(key, value) {
        const sql = `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`;
        return await this.run(sql, [key, JSON.stringify(value)]);
    }

    async getConfig(key, defaultValue = null) {
        const sql = `SELECT value FROM config WHERE key = ?`;
        const row = await this.get(sql, [key]);
        return row ? JSON.parse(row.value) : defaultValue;
    }

    async logEvent(type, message, source = 'SYSTEM') {
        const sql = `INSERT INTO event_log (type, message, source) VALUES (?, ?, ?)`;
        return await this.run(sql, [type, message, source]);
    }

    /**
     * Guarda la última tesis de trading generada por el Scheduler.
     * @param {object} thesis - El objeto de la tesis.
     */
    async saveTradingThesis(thesis) {
        return this.setConfig('latest_trading_thesis', thesis);
    }

    /**
     * Obtiene la última tesis de trading guardada.
     * @returns {Promise<object|null>}
     */
    async getLatestTradingThesis() {
        return this.getConfig('latest_trading_thesis', null);
    }
}
