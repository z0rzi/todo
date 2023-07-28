import { App } from '@/app';
import { Task } from '@interfaces/tasks.interface';
import { TaskRoute } from '@routes/tasks.route';
import * as Db from '@utils/db';
import request from 'supertest';
import { addGoalsInDb } from './goals.test';

jest.mock('@utils/db');
const db = Db.getDB();

const sampleTasks: Task[] = [
  {
    id: 1,
    title: "Suzane's b-day",
    comment: '',
    date: new Date('2020-02-24'),
    color: '#ff2',
    goalId: 1,
    dateCreated: new Date('2022-01-01'),
    duration: -1,
  },
  {
    id: 2,
    title: 'Go to the groceries',
    comment: 'Bananas, apples, chia seeds',
    date: new Date('2020-02-01'),
    color: 'ff5',
    goalId: 1,
    dateCreated: new Date('2022-01-01'),
    duration: 120,
  },
  {
    id: 3,
    title: 'Run',
    comment: '5kms, you can do it!',
    date: new Date('2020-02-03'),
    color: null,
    goalId: 1,
    dateCreated: new Date('2022-01-01'),
    duration: 90,
  },
  {
    id: 4,
    title: 'Look up for second hand chairs',
    comment: 'Maybe on craigslist?',
    date: new Date('2020-02-05'),
    color: null,
    goalId: 2,
    dateCreated: new Date('2022-01-05'),
    duration: 30,
  },
  {
    id: 5,
    title: 'Take current chairs to the trash',
    comment: '',
    date: new Date('2020-02-01'),
    color: null,
    goalId: 2,
    dateCreated: new Date('2022-01-05'),
    duration: 20,
  },
];

function addTasksInDb() {
  const query = db.prepare(
    'INSERT INTO tasks(id, title, comment, date, color, goal_id, date_created, duration) VALUES (?,?,?,?,?,?,?,?)',
  );

  for (const task of sampleTasks) {
    query.run(
      task.id,
      task.title,
      task.comment,
      +task.date,
      task.color,
      task.goalId,
      +task.dateCreated,
      task.duration,
    );
  }
}

beforeEach(() => {
  // Resetting DB
  Db.createStructure();

  addGoalsInDb();
  addTasksInDb();
});

describe('TEST Tasks API', () => {
  const route = new TaskRoute();
  const app = new App([route]);

  describe('[GET] /tasks', () => {
    it('response statusCode 200 /findAll',  done => {
      request(app.getServer())
        .get(`${route.path}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          const foundTasks = res.body.data as Task[];

          foundTasks.forEach(
            task => (
              (task.dateCreated = new Date(task.dateCreated)), (task.date = new Date(task.date))
            ),
          );

          expect(foundTasks).toStrictEqual(sampleTasks);
          done();
        });
    });
  });

  describe('[GET] /tasks/:id', () => {
    it('response statusCode 200 /findOne', done => {
      request(app.getServer())
        .get(`${route.path}/1`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          const foundTask = res.body.data as Task;
          foundTask.dateCreated = new Date(foundTask.dateCreated);
          foundTask.date = new Date(foundTask.date);

          expect(foundTask).toStrictEqual(sampleTasks[0]);
          done();
        });
    });
  });

  describe('[POST] /tasks', () => {
    it('response statusCode 201 /created', done => {
      const taskData: Partial<Task> = {
        title: 'Take the trash out',
        date: new Date('2020-10-01T20:00:00Z'),
        duration: 60,
      };

      request(app.getServer())
        .post(`${route.path}`)
        .send(taskData)
        .expect(201)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          const newTask = res.body.data as Task;
          newTask.dateCreated = new Date(newTask.dateCreated);
          newTask.date = new Date(newTask.date);

          expect(newTask).toEqual(expect.objectContaining(taskData));

          done();
        });
    });
  });

  describe('[PUT] /tasks/:id', () => {
    it('response statusCode 200 /updated', done => {
      const taskId = 1;
      const taskData: Partial<Task> = {
        title: 'Take the trash out',
        color: '#ffe',
      };

      request(app.getServer())
        .put(`${route.path}/${taskId}`)
        .send(taskData)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }
          const newTask = res.body.data as Task;
          newTask.dateCreated = new Date(newTask.dateCreated);
          newTask.date = new Date(newTask.date);

          expect(taskData).toEqual(expect.objectContaining(taskData));

          done();
        });
    });
  });

  describe('[DELETE] /tasks/:id', () => {
    it('response statusCode 200 /deleted', done => {
      request(app.getServer())
        .delete(`${route.path}/1`)
        .expect(200, { message: 'deleted' })
        .then(() => {
          request(app.getServer())
            .get(`${route.path}`)
            .expect(200, (err, res) => {
              const tasks = res.body.data;

              expect(tasks).toHaveLength(sampleTasks.length - 1);

              done();
            });
        });
    });
  });
});
