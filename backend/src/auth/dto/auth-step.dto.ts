import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginStepDto {
  @ApiProperty({ description: 'Step ID from auth flow config', example: 'phone-email' })
  @IsString()
  @IsNotEmpty()
  stepId: string;

  @ApiProperty({ description: 'Session ID for multi-step authentication', example: 'session-uuid', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: 'Step data (depends on step type)', example: { login: 'user@example.com' } })
  @IsObject()
  @IsNotEmpty()
  data: any;
}

export class RegisterStepDto {
  @ApiProperty({ description: 'Step ID from auth flow config', example: 'phone-email' })
  @IsString()
  @IsNotEmpty()
  stepId: string;

  @ApiProperty({ description: 'Session ID for multi-step registration', example: 'session-uuid', required: false })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: 'Step data (depends on step type)', example: { email: 'user@example.com' } })
  @IsObject()
  @IsNotEmpty()
  data: any;
}

export class AuthStepResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Session ID for next steps', required: false })
  sessionId?: string;

  @ApiProperty({ description: 'Next step information', required: false })
  nextStep?: {
    id: string;
    name: string;
    type: string;
    requiresVerification?: boolean;
  };

  @ApiProperty({ description: 'Indicates if this is the last step', required: false })
  completed?: boolean;

  @ApiProperty({ description: 'Auth tokens (only if completed)', required: false })
  accessToken?: string;

  @ApiProperty({ description: 'Refresh token (only if completed)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'User data (only if completed)', required: false })
  user?: any;

  @ApiProperty({ description: 'Error or info message', required: false })
  message?: string;

  @ApiProperty({ description: 'Temporary data for next step', required: false })
  tempData?: any;

  @ApiProperty({ description: 'Additional payload data', required: false })
  payload?: any;

  @ApiProperty({ description: 'Indicates that user should be registered (user not found)', required: false })
  requiresRegistration?: boolean;
}

