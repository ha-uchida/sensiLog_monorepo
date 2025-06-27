import { IsNumber, IsOptional, IsString, IsBoolean, IsArray, Min, Max } from 'class-validator';

export class CreateSettingsDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  sensitivity: number;

  @IsNumber()
  @Min(100)
  @Max(30000)
  dpi: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  scopedSensitivity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(11)
  windowsSensitivity?: number;

  @IsOptional()
  @IsBoolean()
  windowsAcceleration?: boolean;

  @IsOptional()
  @IsString()
  mouseDevice?: string;

  @IsOptional()
  @IsString()
  mousepad?: string;

  @IsOptional()
  @IsString()
  keyboardDevice?: string;

  @IsOptional()
  @IsString()
  screenResolution?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  displayScaling?: string;

  @IsOptional()
  @IsString()
  displayMode?: string;

  @IsOptional()
  @IsBoolean()
  rawInputBuffer?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  innerDeadzone?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  outerDeadzone?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}