import { CreateTaskDto, UpdateTaskDto } from '@/dtos/tasks.dto';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { TaskController } from '@controllers/tasks.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import { GoalRoute } from './goals.route';

export class TaskRoute implements Routes {
  public path = '/tasks';
  public router = Router();
  public task = new TaskController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.task.getTasks);

    this.router.get(`${this.path}/:id(\\d+)`, this.task.getTaskById);

    this.router.get(`${new GoalRoute().path}/:id(\\d+)${this.path}`, this.task.getTasksFromGoal);

    this.router.post(`${this.path}`, ValidationMiddleware(CreateTaskDto), this.task.createTask);

    this.router.put(
      `${this.path}/:id(\\d+)`,
      ValidationMiddleware(UpdateTaskDto),
      this.task.updateTask,
    );

    this.router.delete(`${this.path}/:id(\\d+)`, this.task.deleteTask);
  }
}
