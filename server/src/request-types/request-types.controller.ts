import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
import { RequestTypesService } from './request-types.service';

const { ADMIN, DIRECTOR } = UserRole;

@Controller('request-types')
@UseGuards(RolesGuard)
export class RequestTypesController {
  constructor(private readonly service: RequestTypesService) {}

  @Get()
  getActiveTypes() {
    return this.service.getActiveTypes();
  }

  @Get('manage')
  @Roles(ADMIN, DIRECTOR)
  getAllTypes() {
    return this.service.getAllTypes();
  }

  @Post()
  @Roles(ADMIN, DIRECTOR)
  createType(@Body() dto: CreateRequestTypeDto) {
    return this.service.createType(dto);
  }

  @Patch(':id')
  @Roles(ADMIN, DIRECTOR)
  updateType(@Param('id') id: string, @Body() dto: UpdateRequestTypeDto) {
    return this.service.updateType(id, dto);
  }
}
