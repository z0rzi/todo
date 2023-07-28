import { HttpException } from '@exceptions/httpException';
import { Task } from '@interfaces/tasks.interface';
import * as model from '@models/tasks.model';
import { Service } from 'typedi';

@Service()
export class TaskService {
  public findAllTasks(): Task[] {
    const tasks: Task[] = model.getAllTasks();
    return tasks;
  }

  public findTaskById(taskId: number): Task {
    const findTask: Task = model.getTaskById(taskId)
    if (!findTask) throw new HttpException(409, "Task doesn't exist");

    return findTask;
  }

  public findTaskByGoal(goalId: number): Task[] {
    const tasks: Task[] = model.getTasksByGoalId(goalId)
    return tasks;
  }

  public createTask(taskData: Task) {
    try {
      const newTask = model.addTask(taskData);
      return newTask;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  public updateTask(taskId: number, taskData: Partial<Task>) {
    return model.updateTask(taskId, taskData);
  }

  public deleteTask(taskId: number) {
    model.removeTaskById(taskId);
  }
}
