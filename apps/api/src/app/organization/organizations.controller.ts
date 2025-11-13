import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';

import { OrganizationService } from './organizations.service';
import { Public } from '../auth/decorator/public.decorator';
import {
  OrganizationCreateDto,
  OrganizationUpdateDto,
} from 'libs/data/organization';

@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  create(@Body() body: OrganizationCreateDto) {
    return this.organizationService.create(body);
  }

  @Get()
  @Public()
  list(@Req() req) {
    return this.organizationService.findAll();
  }

  @Get('/parent/:parentId')
  @Public()
  findByParentId(@Param('parentId') parentId: string) {
    try {
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(parentId)) {
        return {
          messsage: 'Invalid parentId. Must be a valid UUID.',
          success: false,
        };
      }
      return this.organizationService.findByParentId(parentId);
    } catch (error) {
      return {
        message: 'An error occurred while validating parentId.',
        success: false,
      };
    }
  }

  @Get('/parents')
  @Public()
  getParentOrganizations() {
    try {
      return this.organizationService.findParentOrganizations();
    } catch (error) {
      return {
        message: 'An error occurred while fetching parent organizations.',
        success: false,
      };
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: OrganizationUpdateDto,
    @Req() req: any
  ) {
    try {
      return this.organizationService.update(id, body);
    } catch (error) {
      return {
        message: 'An error occurred while updating the organization.',
        success: false,
      };
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    try {
      return this.organizationService.remove(id);
    } catch (error) {
      return {
        message: 'An error occurred while deleting the organization.',
        success: false,
      };
    }
  }
}
