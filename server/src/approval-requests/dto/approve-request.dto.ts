import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveRequestDto {
  /** Nhận xét khi phê duyệt (tuỳ chọn) */
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Nhận xét tối đa 500 ký tự' })
  comment?: string;
}
