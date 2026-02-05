import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { OrganisationService } from '@/domain'

import { JwtAuthGuard, RolesGuard } from '../guards'
import { Roles } from '../decorators'

import { OrganisationConverter } from '../converters'

import {
  GetOrganisationListResponse,
  GetOrganisationRefListResponse,
  GetOrganisationResponse,
  OrganisationRequest,
} from '../dtos'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organisations')
export class OrganisationController {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly organisationConverter: OrganisationConverter,
  ) {}

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get organisations' })
  @ApiResponse({ status: 200, type: [GetOrganisationListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getOrganisations(): Promise<GetOrganisationListResponse> {
    const organisations = await this.organisationService.getAllActive()
    return {
      organisations: organisations.map((organisation) =>
        this.organisationConverter.convertOrganisationToDto(organisation),
      ),
    }
  }

  @Get('refs')
  @ApiOperation({ summary: 'Get organisation refs' })
  @ApiResponse({ status: 200, type: [GetOrganisationRefListResponse] })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getOrganisationRefs(): Promise<GetOrganisationRefListResponse> {
    return {
      organisationRefs: await this.organisationService.getAllRefs(),
    }
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get organisation by ID' })
  @ApiResponse({ status: 200, type: GetOrganisationResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async getOrganisationById(@Param('id') id: string): Promise<GetOrganisationResponse> {
    const organisation = await this.organisationService.getById(id)
    return {
      organisation: this.organisationConverter.convertOrganisationToDto(organisation),
    }
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new organisation' })
  @ApiResponse({ status: 201, type: GetOrganisationResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async createOrganisation(@Body() request: OrganisationRequest): Promise<GetOrganisationResponse> {
    const organisation = await this.organisationService.create(request)
    return {
      organisation: this.organisationConverter.convertOrganisationToDto(organisation),
    }
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing organisation' })
  @ApiResponse({ status: 200, type: GetOrganisationResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async updateOrganisation(
    @Param('id') id: string,
    @Body() request: OrganisationRequest,
  ): Promise<GetOrganisationResponse> {
    const organisation = await this.organisationService.update(id, request)
    return {
      organisation: this.organisationConverter.convertOrganisationToDto(organisation),
    }
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable an organisation' })
  @ApiResponse({ status: 200, type: GetOrganisationResponse })
  @ApiResponse({ status: 400, description: 'Failed due to a malformed request' })
  @ApiResponse({ status: 500, description: 'Failed due to a technical error. Try again later' })
  async disableOrganisation(@Param('id') id: string): Promise<GetOrganisationResponse> {
    const organisation = await this.organisationService.disable(id)
    return {
      organisation: this.organisationConverter.convertOrganisationToDto(organisation),
    }
  }
}
