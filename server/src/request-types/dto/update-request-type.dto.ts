import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRequestTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Tên loại yêu cầu tối đa 255 ký tự' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
