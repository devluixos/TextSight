// sqlHandler.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initializeDatabase() {
    const dbDir = 'sqlite';
    const dbName = 'database.db';
    const dbPath = path.join(dbDir, dbName);

    console.log(`Initializing database at ${dbPath}`);

    if (!fs.existsSync(dbDir)){
        console.log(`Directory ${dbDir} does not exist, creating it`);
        fs.mkdirSync(dbDir);
    }

    const db = new Database(dbPath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filePath TEXT UNIQUE NOT NULL,
            lastAnalyzed TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            documentId INTEGER NOT NULL,
            text TEXT NOT NULL,
            type TEXT NOT NULL,
            weight REAL,
            FOREIGN KEY(documentId) REFERENCES documents(id)
        );

        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            documentId INTEGER NOT NULL,
            name TEXT NOT NULL,
            weight REAL,
            FOREIGN KEY(documentId) REFERENCES documents(id)
        );

        CREATE TABLE IF NOT EXISTS similarities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            documentId INTEGER NOT NULL,
            documentName TEXT NOT NULL,
            similarityScore REAL,
            FOREIGN KEY(documentId) REFERENCES documents(id)
        );
    `);

    console.log("Database initialized with required tables.");

    return db;
}