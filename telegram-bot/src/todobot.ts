import { Context, Markup } from 'telegraf';
import { Update } from 'typegram';
import Api from './api';
import { repeat } from './Time';

const api = Api.getInstance(process.env['API_KEY']);

export default class TodoBot {
    private ctx: Context<Update>;

    private get chatType() {
        return this.ctx.chat.type;
    }

    private get userName() {
        return this.ctx.from.username;
    }

    constructor(ctx: Context<Update>) {
        this.ctx = ctx;

        repeat(new Date('2023-07-23T17:00:00Z'), 24 * 7, () => {
            this.ctx.reply('Hey, did you plan your tasks for next week?');
        });

        repeat(new Date('2020-01-01T06:00:00Z'), 24 * 7, () => {
            this.showDayTask();
        });

        repeat(new Date('2020-01-01T06:00:00Z'), 24 * 7, () => {
            this.showDayTask();
        });
    }

    showDayTask() {
        api.getAllTasks().then((tasks) => {
            let dateStart = new Date();
            dateStart.setUTCHours(0, 0, 0, 0);
            let dateEnd = new Date(dateStart);
            dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);
            tasks = tasks.filter(
                (task) => dateStart <= task.date && task.date < dateEnd
            );

            if (!tasks.length) {
                this.ctx.reply('Nothing to do today 😢');
                return;
            }

            this.ctx.reply(
                "Here's what you have to do today:" +
                    tasks.map((goal) => '- ' + goal.title).join('\n')
            );
        });
    }

    addTomorrowTasks() {
        api.getAllTasks().then((tasks) => {
            let dateStart = new Date();
            dateStart.setUTCHours(0, 0, 0, 0);
            dateStart.setUTCDate(dateStart.getUTCDate() + 1);
            let dateEnd = new Date(dateStart);
            dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);
            tasks = tasks.filter(
                (task) => dateStart <= task.date && task.date < dateEnd
            );

            if (tasks.length) {
                return;
            }

            this.ctx.reply(
                "You don't have anything to do tomorrow, choose something to work on!"
            );

            return this.addTaskFromGoal(dateStart);
        });
    }

    addTaskFromGoal(date: Date) {
        api.getAllGoals().then(async (goals) => {
            this.ctx.reply(
                'What would you like to work on?',
                Markup.keyboard(goals.map((goal) => goal.title))
                    .oneTime()
                    .resize()
            );

            return this.waitText()
                .then((text) => {
                    const goal = goals.find((g) => g.title === text);
                    return api.addTask(goal.title, date, goal.id);
                })
                .then(() => {
                    this.ctx.reply('Task added :)');
                });
        });
    }

    async addNewGoal(goalTitle: string) {
        if (!goalTitle) {
            this.ctx.reply('You need to provide a goal...');
            return;
        }
        api.addGoal(goalTitle).then(() => {
            this.ctx.reply('Goal added!');
        });
    }

    async listGoals() {
        api.getAllGoals().then((goals) => {
            goals.sort((a, b) => b.importance - a.importance);
            this.ctx.reply(goals.map((goal) => goal.title).join('\n'));
        });
    }

    async listTasks(time: 'today' | 'tomorrow' | 'week') {
        api.getAllTasks().then((tasks) => {
            tasks = tasks.filter((task) => {
                let dateStart = new Date();
                dateStart.setUTCHours(0, 0, 0, 0);
                let dateEnd = new Date(dateStart);

                if (time === 'today') {
                    dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);
                } else if (time === 'tomorrow') {
                    dateStart.setUTCDate(dateStart.getUTCDate() + 1);
                    dateEnd.setUTCDate(dateEnd.getUTCDate() + 2);
                } else if (time === 'week') {
                    dateEnd.setUTCDate(dateEnd.getUTCDate() + 7);
                }
                return dateStart <= task.date && task.date < dateEnd;
            });

            if (!tasks.length) {
                this.ctx.reply('Nothing to do 😢');
                return;
            }

            this.ctx.reply(tasks.map((goal) => goal.title).join('\n'));
        });
    }

    textCb: (text: string) => void = null;
    private waitText(): Promise<string> {
        return new Promise((resolve) => {
            this.textCb = (text: string) => {
                resolve(text);
            };
        });
    }

    /** To be called when the user sent text which wasn't any known commmand */
    async text(text: string) {
        if (this.textCb) {
            this.textCb(text);
            this.textCb = null;
        } else {
            this.ctx.reply('Unknown command...');
        }
    }
}
