import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateLocationDto } from './dto/update-location.dto';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('birth-year/:year')
  findByBirthYear(@Param('year') year: string) {
    return this.usersService.findByBirthYear(Number(year));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('location')
  updateLocation(@CurrentUser() user: User, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(user.id, dto);
  }

  @Get('nearby/:radiusKm')
  findNearby(@CurrentUser() user: User, @Param('radiusKm') radiusKm: string) {
    return this.usersService.findNearbyUsers(user.latitude, user.longitude, Number(radiusKm));
  }
}
