// server/SecurityManager.js
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SALT_PATH = path.join(process.cwd(), '.salt');
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const ALGORITHM = 'aes-256-cbc';

export class SecurityManager {
    constructor(userMasterPassword) {
        const salt = this._getOrCreateSalt();
        const key = crypto.pbkdf2Sync(userMasterPassword, salt, ITERATIONS, KEY_LENGTH, DIGEST);
        this.key = key;
    }

    _getOrCreateSalt() {
        if (fs.existsSync(SALT_PATH)) {
            return fs.readFileSync(SALT_PATH);
        } else {
            const salt = crypto.randomBytes(16);
            fs.writeFileSync(SALT_PATH, salt);
            return salt;
        }
    }

    encryptData(plaintextData) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
        let encrypted = cipher.update(plaintextData, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Prepend the IV for use in decryption
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decryptData(encryptedData) {
        try {
            const [ivHex, encryptedHex] = encryptedData.split(':');
            if (!ivHex || !encryptedHex) {
                throw new Error('Invalid encrypted data format');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error("Failed to decrypt data. Master password might be incorrect.", error);
            return null;
        }
    }
}
