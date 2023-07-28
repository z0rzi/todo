export interface Goal {
  id?: number;

  title: string;
  comment?: string;

  color: string;

  importance: number;

  parentId?: number;
  dateCreated: Date;
}
