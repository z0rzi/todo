import { HttpException } from '@exceptions/httpException';
import { Goal } from '@interfaces/goals.interface';
import * as model from '@models/goals.model';
import { Service } from 'typedi';

@Service()
export class GoalService {
  public findAllGoals(): Goal[] {
    const goals: Goal[] = model.getAllGoals();
    return goals;
  }

  public findGoalById(goalId: number): Goal {
    const findGoal: Goal = model.getGoalById(goalId)
    if (!findGoal) throw new HttpException(409, "Goal doesn't exist");

    return findGoal;
  }

  public createGoal(goalData: Goal) {
    try {
      const newGoal = model.addGoal(goalData);
      return newGoal;
    } catch (err) {
      throw new HttpException(400, err.message);
    }
  }

  public updateGoal(goalId: number, goalData: Partial<Goal>) {
    model.updateGoal(goalId, goalData);
    return model.getAllGoals();
  }

  public deleteGoal(goalId: number) {
    model.removeGoalById(goalId);
    return model.getAllGoals();
  }
}
