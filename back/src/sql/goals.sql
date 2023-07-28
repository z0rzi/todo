DROP TABLE IF EXISTS goals;

CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL UNIQUE,
    comment TEXT,
    color TEXT,

    importance INTEGER,
    date_created INTEGER,

    parent_id INTEGER,

    CONSTRAINT goals_goal_fk
        FOREIGN KEY(parent_id)
        REFERENCES goals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
