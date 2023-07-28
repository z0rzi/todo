import {
  IsDateString,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  public title: string;

  @IsOptional()
  @IsString()
  public comment: string;

  @IsDateString()
  public date: string;

  @IsOptional()
  @IsNumber()
  public goalId: number;

  @IsOptional()
  @IsHexColor()
  public color: string;

  @IsOptional()
  @IsNumber()
  // negative dutation = all day event
  @Min(-1)
  @Max(60 * 6)
  public duration: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  public title: string;

  @IsOptional()
  @IsString()
  public comment: string;

  @IsOptional()
  @IsDateString()
  public date: string;

  @IsOptional()
  @IsNumber()
  public goalId: number;

  @IsOptional()
  @IsHexColor()
  public color: string;

  @IsOptional()
  @IsNumber()
  // negative dutation = all day event
  @Min(-1)
  @Max(60 * 6)
  public duration: number;
}
