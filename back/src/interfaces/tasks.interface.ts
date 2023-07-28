export interface Task {
  id?: number;

  title: string;
  comment?: string;
  color?: string;

  date: Date;
  duration: number;

  goalId?: number;

  dateCreated: Date;
}
