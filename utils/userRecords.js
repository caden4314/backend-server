const path = require('path');
const { readJsonFile, writeJsonFile } = require('./fileSystem');

const recordsPath = path.join(__dirname, '..', 'data', 'user_records.json');

function getUserRecords(userId) {
    const records = readJsonFile(recordsPath, {});
    return records[userId] || {
        warnings: [],
        mutes: [],
        bans: [],
        tempbans: []
    };
}

function addUserRecord(userId, type, data) {
    const records = readJsonFile(recordsPath, {});
    if (!records[userId]) {
        records[userId] = {
            warnings: [],
            mutes: [],
            bans: [],
            tempbans: []
        };
    }
    
    records[userId][type].push({
        ...data,
        timestamp: new Date().toISOString()
    });
    
    writeJsonFile(recordsPath, records);
    return records[userId];
}

module.exports = {
    getUserRecords,
    addUserRecord
};