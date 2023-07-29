import axios, { AxiosInstance } from 'axios';
import List from './List';

type ApiResponse<T = unknown> = {
    data: T;
    message: string;
};

export type Goal = {
    id: number;

    title: string;
    comment?: string;

    color: string;

    importance: number;

    parentId?: number;
    dateCreated: Date;
};
export type Task = {
    id: number;

    title: string;
    comment?: string;
    color?: string;

    date: Date;
    duration: number;

    goalId?: number;

    dateCreated: Date;
};

const env = process.env['NODE_ENV'] || 'dev';

export default class Api {
    private apiToken = '';
    apiUrl = env === 'prod' ? 'http://backend:8500' : 'http://127.0.0.1:8500';
    client: AxiosInstance;

    get authHeader() {
        return { Authorization: this.apiToken };
    }

    private static instance: Api;
    static getInstance(apiKey: string) {
        if (!this.instance) this.instance = new Api();
        this.instance.apiToken = apiKey;
        return this.instance;
    }

    private constructor() {
        this.apiToken = this.apiToken;

        let headers = {
            Accept: 'application/json'
        } as Record<string, string>;

        if (this.apiToken) {
            headers['Authorization'] = `${this.apiToken}`;
        }

        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: 31000,
            headers: headers
        });
    }

    async getAllTasks(): Promise<List<Task>> {
        return this.client
            .get<ApiResponse<Task[]>>('/tasks', { headers: this.authHeader })
            .then((res) => {
                const tasks = res.data.data as Task[];
                tasks.forEach((task) => {
                    task.date = new Date(task.date);
                    task.dateCreated = new Date(task.dateCreated);
                });
                return new List(tasks);
            });
    }

    async addTask(title: string, date: Date, goalId?: number): Promise<Task> {
        return this.client
            .post<ApiResponse<Task>>(
                '/tasks',
                { title, date: date.toISOString(), goalId: goalId ?? null },
                { headers: this.authHeader }
            )
            .then((res) => {
                const task = res.data.data as Task;
                task.date = new Date(task.date);
                task.dateCreated = new Date(task.dateCreated);
                return task;
            });
    }

    async updateTask(taskId: number, newTask: Partial<Task>): Promise<Task> {
        return this.client
            .put<ApiResponse<Task>>('/tasks/' + taskId, newTask, {
                headers: this.authHeader
            })
            .then((res) => {
                const task = res.data.data as Task;
                task.date = new Date(task.date);
                task.dateCreated = new Date(task.dateCreated);
                return task;
            });
    }

    async deleteTask(taskId: number): Promise<void> {
        return this.client
            .delete<ApiResponse>('/tasks/' + taskId, {
                headers: this.authHeader
            })
            .then(() => {});
    }

    async getAllGoals(): Promise<List<Goal>> {
        return this.client
            .get<ApiResponse<Goal[]>>('/goals', { headers: this.authHeader })
            .then((res) => {
                const goals = res.data.data as Goal[];
                goals.sort((a, b) => b.importance - a.importance);
                return new List(goals);
            });
    }

    async addGoal(title: string): Promise<Goal> {
        return this.client
            .post<ApiResponse<Goal>>(
                '/goals',
                { title },
                { headers: this.authHeader }
            )
            .then((res) => {
                return res.data.data;
            });
    }

    async moveGoal(goalId: number, newPosition: number): Promise<List<Goal>> {
        return this.client
            .put<ApiResponse<Goal[]>>(
                '/goals/' + goalId,
                { importance: newPosition },
                { headers: this.authHeader }
            )
            .then((res) => {
                const goals = res.data.data as Goal[];
                goals.sort((a, b) => b.importance - a.importance);
                return new List(goals);
            });
    }

    async deleteGoal(goalId: number): Promise<List<Goal>> {
        return this.client
            .delete<ApiResponse<Goal[]>>('/goals/' + goalId, {
                headers: this.authHeader
            })
            .then((res) => {
                const goals = res.data.data as Goal[];
                goals.sort((a, b) => b.importance - a.importance);
                return new List(goals);
            });
    }
}
