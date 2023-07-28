import { CreateGoalDto, UpdateGoalDto } from '@/dtos/goals.dto';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { GoalController } from '@controllers/goals.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';

export class GoalRoute implements Routes {
  public path = '/goals';
  public router = Router();
  public goal = new GoalController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.goal.getGoals);

    this.router.get(`${this.path}/:id(\\d+)`, this.goal.getGoalById);

    this.router.post(`${this.path}`, ValidationMiddleware(CreateGoalDto), this.goal.createGoal);

    this.router.put(
      `${this.path}/:id(\\d+)`,
      ValidationMiddleware(UpdateGoalDto),
      this.goal.updateGoal,
    );

    this.router.delete(`${this.path}/:id(\\d+)`, this.goal.deleteGoal);
  }
}
