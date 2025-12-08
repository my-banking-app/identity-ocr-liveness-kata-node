import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import fs from 'fs';
import path from 'path';
import { CryptoService } from '../services/crypto.service';

const router = express.Router();

// Helper to decrypt log content line by line
const decryptLogContent = (content: string) => {
    return content.split('\n').map(line => {
        if (!line.trim()) return line;
        try {
            const logEntry = JSON.parse(line);
            
            // Decrypt message if marked [ENCRYPTED]
            if (logEntry.message && logEntry.message.startsWith('[ENCRYPTED] ')) {
                const encryptedPart = logEntry.message.replace('[ENCRYPTED] ', '');
                logEntry.message = CryptoService.decrypt(encryptedPart);
            }

            // Decrypt details if marked [ENCRYPTED]
            if (logEntry.details && typeof logEntry.details === 'string' && logEntry.details.startsWith('[ENCRYPTED] ')) {
                const encryptedDetails = logEntry.details.replace('[ENCRYPTED] ', '');
                logEntry.details = JSON.parse(CryptoService.decrypt(encryptedDetails));
            }

            return logEntry;
        } catch (e) {
            return line; // Return original if parse fails
        }
    });
};

router.get('/logs', authenticateToken, (req, res) => {
    // Only allow specific users or admin in real scenario
    // For now, just authenticated
    
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
        return res.json({ logs: [] });
    }

    // Get most recent application log
    const files = fs.readdirSync(logDir)
        .filter(f => f.startsWith('application-'))
        .sort().reverse();

    if (files.length === 0) return res.json({ logs: [] });

    const recentLog = files[0];
    const content = fs.readFileSync(path.join(logDir, recentLog), 'utf-8');
    
    const decryptedLogs = decryptLogContent(content);
    res.json({ file: recentLog, logs: decryptedLogs });
});

router.get('/security-logs', authenticateToken, (req, res) => {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) return res.json({ logs: [] });

    const files = fs.readdirSync(logDir)
        .filter(f => f.startsWith('security-'))
        .sort().reverse();

    if (files.length === 0) return res.json({ logs: [] });

    const recentLog = files[0];
    const content = fs.readFileSync(path.join(logDir, recentLog), 'utf-8');
    
    const decryptedLogs = decryptLogContent(content);
    res.json({ file: recentLog, logs: decryptedLogs });
});

export default router;
