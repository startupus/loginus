import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus, InvitationType } from '../entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  email: string | null;

  @ApiProperty({ enum: InvitationType })
  type: InvitationType;

  @ApiProperty({ required: false })
  organizationId?: string;

  @ApiProperty({ required: false })
  teamId?: string;

  @ApiProperty({ required: false })
  familyGroupId?: string;

  @ApiProperty({ enum: InvitationStatus })
  status: InvitationStatus;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty()
  invitedById: string;

  @ApiProperty({ required: false })
  acceptedById?: string | null;

  @ApiProperty()
  token: string;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  acceptedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  invitationLink: string;
}