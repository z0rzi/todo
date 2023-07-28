import Database, { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { dbPath } from '@config';

export { dbPath };

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
  const goal_schema_txt = fs.readFileSync(path.join(dirname, '../sql/goals.sql'), {
    encoding: 'utf8',
  });
  const task_schema_txt = fs.readFileSync(path.join(dirname, '../sql/tasks.sql'), {
    encoding: 'utf8',
  });

  db.exec(goal_schema_txt);
  db.exec(task_schema_txt);
}

let dbIsReady = false;
export function getDB(): DatabaseType {
  if (!dbIsReady && !isDbReady()) {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, '');
    }
    createStructure();
    dbIsReady = true;
  }
  return db;
}
