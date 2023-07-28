import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Goal } from '@interfaces/goals.interface';
import { GoalService } from '@services/goals.service';

export class GoalController {
  public goal = Container.get(GoalService);

  public getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllGoalsData: Goal[] = this.goal.findAllGoals();

      res.status(200).json({ data: findAllGoalsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goalId = Number(req.params.id);
      const findOneGoalData: Goal = this.goal.findGoalById(goalId);

      res.status(200).json({ data: findOneGoalData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goalData: Goal = req.body;
      const newGoal = this.goal.createGoal(goalData);

      res.status(201).json({ message: 'created', data: newGoal });
    } catch (error) {
      next(error);
    }
  };

  public updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goalId = Number(req.params.id);
      const goalData: Goal = req.body;
      const allGoals = this.goal.updateGoal(goalId, goalData);

      res.status(200).json({ data: allGoals, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goalId = Number(req.params.id);
      const remainingGoals = this.goal.deleteGoal(goalId);

      res.status(200).json({ message: 'deleted', data: remainingGoals });
    } catch (error) {
      next(error);
    }
  };
}
