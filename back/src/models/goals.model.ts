import { Goal } from '@interfaces/goals.interface';

import * as Db from '@utils/db';
const db = Db.getDB();

type DbGoal = {
  id: number;
  title: string;
  comment?: string;
  color?: string;
  parent_id?: number;
  importance: number;
  date_created: number;
};

function db2goal(dbGoal: DbGoal): Goal {
  const goal: Goal = {
    id: dbGoal.id,
    title: dbGoal.title,
    comment: dbGoal.comment,
    parentId: dbGoal.parent_id,
    dateCreated: new Date(dbGoal.date_created),
    color: dbGoal.color,
    importance: dbGoal.importance,
  };

  return goal;
}

export function getAllGoals(parentId?: number | null): Goal[] {
  let query = 'SELECT * FROM goals';
  if (typeof parentId !== 'undefined') {
    query += ' WHERE parent_id ' + (parentId == null ? 'IS NULL' : '= ' + parentId);
  }
  query += ' ORDER BY importance DESC';
  const res = db.prepare(query).all() as DbGoal[];

  return res.map(db2goal);
}

export function getGoalById(goalId: number): Goal {
  const query = `SELECT * FROM goals WHERE id = ? LIMIT 1`;
  const res = db.prepare<number>(query).get(goalId) as DbGoal;
  return db2goal(res);
}

export function removeGoalById(goalId: number) {
  const goal = getGoalById(goalId);

  const query = `DELETE FROM goals WHERE id = ? RETURNING id`;
  const id = db.prepare<number>(query).get(goalId);
  if (!id) throw new Error('This ID does not correspond to any goal, nothing deleted!');

  shiftGoals(goal.parentId, goal.importance, null, true);
}

function getNewImportance(parentId?: number) {
  const query =
    'SELECT MAX(importance) as max_importance FROM goals WHERE parent_id ' +
    (parentId ? '= ' + parentId : 'IS NULL');
  const res = db.prepare(query).get() as { max_importance: number };
  if (!res || res?.max_importance == null) return 0;
  return +res['max_importance'] + 1;
}

export function addGoal(goal: Goal) {
  const query = `INSERT INTO goals(
    title,
    comment,
    color,
    parent_id,
    importance,
    date_created
  ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`;

  goal.importance = getNewImportance(goal.parentId);

  const insert = db.prepare(query);

  const newGoal = insert.get(
    goal.title,
    goal.comment,
    goal.color,
    goal.parentId,
    goal.importance,
    Date.now(),
  ) as DbGoal;

  return db2goal(newGoal);
}

/**
 * @param toImportance if not provided, will shift all the goals more important than fromImportance
 * @param backwards true = less important
 */
export function shiftGoals(
  parentId: number | null,
  fromImportance: number,
  toImportance?: number,
  towardsZero = false,
) {
  let allGoals = getAllGoals(parentId);
  if (!allGoals.length) return;

  if (toImportance == null) {
    toImportance = Math.max(fromImportance, ...allGoals.map(g => g.importance));
  }

  if (fromImportance > toImportance)
    [fromImportance, toImportance] = [toImportance, fromImportance];

  const ids = allGoals
    .filter(({ importance }) => fromImportance <= importance && importance <= toImportance)
    .map(goal => goal.id);

  const request = `
        UPDATE goals
        SET importance = importance ${towardsZero ? '-' : '+'} 1
        WHERE id IN (${ids.join(',')})
    `;
  db.prepare(request).run();
}

export function moveGoal(goalId: number, destination: number): void {
  let allGoals = getAllGoals() || [];

  const goal = allGoals.find(goal => goal.id === goalId);

  // We only keep the goals having the same parents as the moved goal, and not the
  // moved goal itself.
  allGoals = allGoals.filter(g => g.id !== goal.id && g.parentId === goal.parentId);

  const source = goal.importance;
  if (destination === source) return;

  destination = Math.min(destination, Math.max(...allGoals.map(p => p.importance)));
  destination = Math.max(destination, 0);

  // We change the importance of all the goals between the old and new position
  shiftGoals(goal.parentId, source, destination, destination > source);

  // We update the importance of the goal.
  db.prepare(`UPDATE goals SET importance = ? WHERE id = ?`).run(destination, goalId);
}

export function updateGoal(goalId: number, newGoal: Partial<Goal>): Goal {
  if (goalId == null) {
    throw new Error('The goal needs an ID to be updated!');
  }

  const oldGoal = getGoalById(goalId);

  if ('parentId' in newGoal && newGoal.parentId !== oldGoal.parentId) {
    // The parent of this goal changed. We need to change the parent in the DB and
    // update its importance.
    const oldParent = oldGoal.parentId;
    const newParent = newGoal.parentId;

    if (newParent === goalId) {
      throw new Error('A goal cannot be its own parent!');
    }

    // We shift the importance of the goals in the old group, to fill the gap
    shiftGoals(oldParent, oldGoal.importance, null, true);

    if (newGoal.importance != null) {
      // We want to give it a specific importance
      // We create an empty spot in the new group
      shiftGoals(newParent, newGoal.importance, null, false);

      // Making sure that the new importance is not too high...
      if (newGoal.importance > 0) {
        newGoal.importance = Math.min(getNewImportance(newParent), newGoal.importance);
      }
      else if (newGoal.importance < 0) newGoal.importance = 0;
    } else {
      // No specific importance, we set it as the most important.
      newGoal.importance = getNewImportance(newParent);
    }
    db.prepare(`UPDATE goals SET importance = ?, parent_id = ? WHERE id = ?`).run(
      newGoal.importance,
      newParent,
      goalId,
    );
  } else {
    // The parent stays the same.
    if ('importance' in newGoal && newGoal.importance !== oldGoal.importance) {
      // The importance changes
      moveGoal(goalId, newGoal.importance);
    }
  }
  delete newGoal.importance;
  delete newGoal.parentId;

  const props = [] as string[];
  const values = [] as (number | string)[];

  for (const key of ['title', 'comment', 'color']) {
    if (newGoal[key] != null) {
      props.push(key);
      values.push(newGoal[key]);
    }
  }

  if (!props.length) return getGoalById(goalId);

  const query = `UPDATE goals SET ${props
    .map(prop => prop + ' = ?')
    .join(', ')} WHERE id = ? RETURNING *`;

  const insert = db.prepare(query);

  const res = insert.get(...values, goalId) as DbGoal;

  return db2goal(res);
}
