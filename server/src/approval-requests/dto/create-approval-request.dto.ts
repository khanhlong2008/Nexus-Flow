import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApprovalRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(255, { message: 'Tiêu đề không được vượt quá 255 ký tự' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  /** Loại yêu cầu theo module: "LEAVE" | "EXPENSE" | "PURCHASE" | ... */
  @IsString()
  @IsNotEmpty({ message: 'Loại yêu cầu không được để trống' })
  requestType: string;

  @IsOptional()
  payload?: Record<string, unknown>;
}
