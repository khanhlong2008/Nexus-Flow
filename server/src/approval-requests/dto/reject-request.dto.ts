import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectRequestDto {
  /** Lý do từ chối (bắt buộc để tạo audit trail rõ ràng) */
  @IsString()
  @IsNotEmpty({ message: 'Lý do từ chối không được để trống' })
  @MaxLength(500, { message: 'Lý do từ chối tối đa 500 ký tự' })
  comment: string;
}
