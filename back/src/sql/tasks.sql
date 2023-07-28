DROP TABLE IF EXISTS tasks;

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    comment TEXT,
    color TEXT,

    date NUMBER NOT NULL,
    duration NUMBER NOT NULL,

    goal_id NUMBER,

    date_created NUMBER NOT NULL,

    CONSTRAINT task_goal_fk
        FOREIGN KEY(goal_id)
        REFERENCES goals(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
