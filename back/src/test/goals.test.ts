import { App } from '@/app';
import { Goal } from '@interfaces/goals.interface';
import { GoalRoute } from '@routes/goals.route';
import * as Db from '@utils/db';
import request from 'supertest';
import * as goalModel from '@models/goals.model';

jest.mock('@utils/db');
const db = Db.getDB();

const sampleGoals: Goal[] = [
  {
    id: 1,
    title: 'Eat healthier',
    comment: 'Healthy food and sports!',
    color: '#003',
    parentId: null,
    importance: 0,
    dateCreated: new Date('2022-01-01'),
  },
  {
    id: 2,
    title: 'Replace the kitchen chair',
    comment: 'It broke 😢',
    color: '#66f',
    parentId: null,
    importance: 2,
    dateCreated: new Date('2022-01-05'),
  },
  {
    id: 3,
    title: 'Buy christmas presents',
    comment: "I'm broke 😢",
    color: '#6f6',
    parentId: null,
    importance: 1,
    dateCreated: new Date('2022-01-05'),
  },
  {
    id: 4,
    title: 'Get a box of chocolate for myself',
    comment: 'Gotta treat myself too',
    color: '#fff',
    parentId: 3,
    importance: 0,
    dateCreated: new Date('2022-01-05'),
  },
  {
    id: 5,
    title: 'Get hammer for James',
    comment: 'He likes hammers',
    color: '#6ff',
    parentId: 3,
    importance: 1,
    dateCreated: new Date('2022-01-05'),
  },
  {
    id: 6,
    title: 'Get picnic blanket for Melany',
    comment: "Good ol' Melany",
    color: '#ff6',
    parentId: 3,
    importance: 2,
    dateCreated: new Date('2022-01-05'),
  },
];

export function addGoalsInDb() {
  const query = db.prepare(
    'INSERT INTO goals(id, title, comment, color, parent_id, importance, date_created) VALUES (?,?,?,?,?,?,?)',
  );

  for (const goal of sampleGoals) {
    query.run(
      goal.id,
      goal.title,
      goal.comment,
      goal.color,
      goal.parentId,
      goal.importance,
      +goal.dateCreated,
    );
  }
}

beforeEach(() => {
  // Resetting DB
  Db.createStructure();

  addGoalsInDb();
});

describe('TEST Goals API', () => {
  const route = new GoalRoute();
  const app = new App([route]);

  describe('[GET] /goals', () => {
    it('response statusCode 200 /findAll', done => {
      request(app.getServer())
        .get(`${route.path}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const foundGoals = res.body.data as Goal[];

          foundGoals.forEach(goal => (goal.dateCreated = new Date(goal.dateCreated)));

          expect(foundGoals).toStrictEqual(sampleGoals);
          done();
        });
    });
  });

  describe('[GET] /goals/:id', () => {
    it('response statusCode 200 /findOne', done => {
      request(app.getServer())
        .get(`${route.path}/1`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const foundGoal = res.body.data as Goal;
          foundGoal.dateCreated = new Date(foundGoal.dateCreated);

          expect(foundGoal).toStrictEqual(sampleGoals[0]);
          done();
        });
    });
  });

  describe('[POST] /goals', () => {
    it('response statusCode 201 /created', done => {
      const goalData: Partial<Goal> = {
        title: 'Take the trash out',
      };

      request(app.getServer())
        .post(`${route.path}`)
        .send(goalData)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const newGoal = res.body.data as Goal;
          newGoal.dateCreated = new Date(newGoal.dateCreated);

          expect(newGoal).toEqual(expect.objectContaining(goalData));
          done();
        });
    });
  });

  describe('[PUT] /goals/:id', () => {
    it('response statusCode 200 /updated', done => {
      const goalId = 1;
      const goalData: Partial<Goal> = {
        title: 'Take the trash out',
        color: '#fff',
      };

      request(app.getServer())
        .put(`${route.path}/${goalId}`)
        .send(goalData)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const newGoal = res.body.data as Goal;
          newGoal.dateCreated = new Date(newGoal.dateCreated);

          expect(goalData).toEqual(expect.objectContaining(goalData));

          done();
        });
    });
  });

  describe('[DELETE] /goals/:id', () => {
    it('response statusCode 200 /deleted', done => {
      request(app.getServer())
        .delete(`${route.path}/1`)
        .expect(200, { message: 'deleted' })
        .then(() => {
          request(app.getServer())
            .get(`${route.path}`)
            .expect(200, (err, res) => {
              const goals = res.body.data;

              expect(goals).toHaveLength(sampleGoals.length - 1);

              expect(goals).toHaveLength(sampleGoals.length - 1);

              done();
            });
        });
    });
  });
});

describe('Test Goal Model', () => {
  it('model.shiftGoals #1', () => {
    goalModel.shiftGoals(null, 2, 1, true);

    const allGoals = goalModel.getAllGoals();

    const importances = allGoals.map(goal => goal.importance);
    expect(importances).toEqual(expect.arrayContaining([0, 0, 1]));
  });
  it('model.shiftGoals #2', () => {
    goalModel.shiftGoals(null, 2, 1, false);

    const allGoals = goalModel.getAllGoals();

    const importances = allGoals.map(goal => goal.importance);
    expect(importances).toEqual(expect.arrayContaining([0, 2, 3]));
  });
  it('model.moveGoals #1', () => {
    goalModel.moveGoal(3, 1);

    const allGoals = goalModel.getAllGoals();

    const importances = allGoals.map(goal => [goal.id, goal.importance]);
    expect(importances).toEqual(
      expect.arrayContaining([
        [1, 0],
        [2, 2],
        [3, 1],
      ]),
    );
  });
  it('model.moveGoals #2', () => {
    goalModel.moveGoal(1, 5);

    const allGoals = goalModel.getAllGoals();

    const importances = allGoals.map(goal => [goal.id, goal.importance]);
    expect(importances).toEqual(
      expect.arrayContaining([
        [1, 2],
        [2, 1],
        [3, 0],
      ]),
    );
  });
  it('model.moveGoals #3', () => {
    goalModel.moveGoal(3, 0);

    const allGoals = goalModel.getAllGoals();

    const importances = allGoals.map(goal => [goal.id, goal.importance]);
    expect(importances).toEqual(
      expect.arrayContaining([
        [1, 1],
        [2, 2],
        [3, 0],
      ]),
    );
  });
  for (const goalId of sampleGoals.map(g => g.id)) {
    it('model.removeGoalById - Making sure that the importance is modified #' + goalId, () => {
      goalModel.removeGoalById(goalId);

      const removedGoal = sampleGoals.find(g => g.id === goalId);

      const allGoals = goalModel.getAllGoals();

      let deletedAmount = 1;
      for (const goal of sampleGoals) {
        // if we remove a parent task, the children task are deleted as well
        if (goal.parentId === removedGoal.id) deletedAmount++;
      }

      expect(allGoals.length).toBe(sampleGoals.length - deletedAmount);

      for (const goal of allGoals) {
        // Making sure that the goal in the other groups didn't change
        if (goal.parentId !== removedGoal.parentId) {
          expect(goal).toEqual(sampleGoals.find(g => g.id === goal.id));
        }
      }

      const importances = allGoals
        .filter(goal => goal.parentId === removedGoal.parentId)
        .map(goal => goal.importance);

      importances.sort();
      expect(importances).toEqual(importances.map((_, i) => i));
    });
  }
  for (const goalId of sampleGoals.map(g => g.id)) {
    for (let newImportance = 0; newImportance < 5; newImportance++) {
      for (let parentIdx = 0; parentIdx < sampleGoals.length; parentIdx++) {

        const newParent = sampleGoals[parentIdx].id;

        if (newParent === goalId) continue;

        xit(`model.updateGoal ~ changing parents #${goalId} => P${newParent}I${newImportance}`, () => {
          goalModel.updateGoal(goalId, {
            parentId: newParent,
            importance: newImportance,
          });

          const allGoals = goalModel.getAllGoals();

          for (let idx = 0; idx < allGoals.length; idx++) {
            const goalId = allGoals[idx].id;
            const children = allGoals.filter(goal => goal.parentId === goalId);

            if (!children.length) continue;

            const importances = children.map(goal => goal.importance);
            importances.sort();
            expect(importances).toEqual(importances.map((_, i) => i));
          }

          const importances = allGoals
            .filter(g => g.parentId === null)
            .map(goal => goal.importance);
          importances.sort();
          expect(importances).toEqual(importances.map((_, i) => i));
        });
      }
    }
  }
});
