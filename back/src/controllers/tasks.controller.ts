import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Task } from '@interfaces/tasks.interface';
import { TaskService } from '@services/tasks.service';

export class TaskController {
  public task = Container.get(TaskService);

  public getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllTasksData: Task[] = this.task.findAllTasks();

      res.status(200).json({ data: findAllTasksData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTasksFromGoal = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const goalId = Number(req.params.id);
      const taskData: Task[] = this.task.findTaskByGoal(goalId);

      res.status(200).json({ data: taskData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      const findOneTaskData: Task = this.task.findTaskById(taskId);

      res.status(200).json({ data: findOneTaskData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskData: Task = req.body;
      if ('date' in taskData) taskData.date = new Date(taskData.date);
      const newTask = this.task.createTask(taskData);

      res.status(201).json({ message: 'created', data: newTask });
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      const taskData: Task = req.body;
      if ('date' in taskData && taskData.date != null) taskData.date = new Date(taskData.date);
      const newTask = this.task.updateTask(taskId, taskData);

      res.status(200).json({ data: newTask, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = Number(req.params.id);
      this.task.deleteTask(taskId);

      res.status(200).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
