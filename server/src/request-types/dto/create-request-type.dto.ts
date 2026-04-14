import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRequestTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã loại yêu cầu không được để trống' })
  @MaxLength(50, { message: 'Mã loại yêu cầu tối đa 50 ký tự' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên loại yêu cầu không được để trống' })
  @MaxLength(255, { message: 'Tên loại yêu cầu tối đa 255 ký tự' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
