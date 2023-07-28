import { App } from '@/app';
import { GoalRoute } from '@routes/goals.route';
import { ValidateEnv } from '@utils/validateEnv';
import { TaskRoute } from './routes/tasks.route';

ValidateEnv();

const app = new App([new GoalRoute(), new TaskRoute()]);

app.listen();
