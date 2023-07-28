import { Task } from '@interfaces/tasks.interface';

import * as Db from '@utils/db';
const db = Db.getDB();

type DbTask = {
  id: number;
  title: string;
  comment?: string;
  date?: number;
  duration?: number;
  color?: string;
  goal_id?: number;
  date_created: number;
};

function db2task(dbTask: DbTask): Task {
  const task: Task = {
    id: dbTask.id,
    title: dbTask.title,
    comment: dbTask.comment,
    date: new Date(dbTask.date),
    goalId: dbTask.goal_id,
    dateCreated: new Date(dbTask.date_created),
    duration: dbTask.duration,
    color: dbTask.color,
  };

  return task;
}

export function getAllTasks(): Task[] {
  const query = `SELECT * FROM tasks`;
  const res = db.prepare(query).all() as DbTask[];

  return res.map(db2task);
}

export function getTasksByGoalId(goalId: number): Task[] {
  const query = `SELECT * FROM tasks WHERE goal_id = ?`;
  const res = db.prepare(query).all(goalId) as DbTask[];

  return res.map(db2task);
}

export function getTaskById(taskId: number): Task {
  const query = `SELECT * FROM tasks WHERE id = ? LIMIT 1`;
  const res = db.prepare<number>(query).get(taskId) as DbTask;
  return db2task(res);
}

export function removeTaskById(taskId: number) {
  const query = `DELETE FROM tasks WHERE id = ? RETURNING id`;
  const id = db.prepare<number>(query).get(taskId);
  if (!id) throw new Error('This ID does not correspond to any task, nothing deleted!');
}

export function addTask(task: Task) {
  const query = `INSERT INTO tasks(
    title,
    comment,
    color,
    date,
    duration,
    goal_id,
    date_created
  ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`;

  const insert = db.prepare(query);

  const newTask = insert.get(
    task.title,
    task.comment,
    task.color,
    +task.date,
    task.duration == null ? -1 : task.duration,
    task.goalId,
    Date.now(),
  ) as DbTask;

  return db2task(newTask);
}

export function updateTask(taskId: number, task: Partial<Task>): Task {
  if (taskId == null) {
    throw new Error('The task needs an ID to be updated!');
  }

  const props = [] as string[];
  const values = [] as (number | string)[];

  for (const key of ['title', 'comment', 'duration', 'duration', 'color']) {
    if (task[key] != null) {
      props.push(key);
      values.push(task[key]);
    }
  }

  if (task.date != null) {
    props.push('date');
    values.push(+task.date);
  }

  console.log(task);

  const goalId = task.goalId;

  if (typeof goalId !== 'undefined') {
    props.push('goal_id');
    values.push(goalId);
  }

  if (!props.length) return getTaskById(taskId);

  const query = `UPDATE tasks SET ${props
    .map(prop => prop + ' = ?')
    .join(', ')} WHERE id = ? RETURNING *`;

  const insert = db.prepare(query);

  const res = insert.get(...values, taskId) as DbTask;

  if (!res) throw new Error('This ID does not correspond to any task, nothing updated!');

  return db2task(res);
}
