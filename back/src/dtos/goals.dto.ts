import {
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  public title: string;

  @IsOptional()
  @IsString()
  public comment: string;

  @IsOptional()
  @IsNumber()
  public parentId: number;

  @IsOptional()
  @IsHexColor()
  public color: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  public title: string;

  @IsOptional()
  @IsString()
  public comment: string;

  @IsOptional()
  @IsHexColor()
  public color: string;

  @IsOptional()
  @IsNumber()
  public parentId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public importance: number;
}
