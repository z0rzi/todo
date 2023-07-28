import Database, { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
export const dbPath = '/tmp/_tests.db';

const dirname = __dirname;

const db = new Database(
    dbPath,
    // { verbose: console.log }
);

function isDbReady(): boolean {
    try {
        const stmt = db.prepare('SELECT * FROM goals');
        stmt.run();
    } catch (err) {
        // console.error(err);
        return false;
    }

    return true;
}

export function createStructure() {
    const goal_schema_txt = fs.readFileSync(
        path.join(dirname, '../../sql/goals.sql'),
        { encoding: 'utf8' }
    );
    const task_schema_txt = fs.readFileSync(
        path.join(dirname, '../../sql/tasks.sql'),
        { encoding: 'utf8' }
    );

    db.exec(goal_schema_txt);
    db.exec(task_schema_txt);
}

let dbIsReady = false;
export function getDB(): DatabaseType {
    if (!dbIsReady && !isDbReady()) {
        createStructure();
        dbIsReady = true;
    }
    return db;
}
