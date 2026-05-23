import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'emba-super-secret-jwt-key-2024',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException('인증이 만료되었습니다.');
    return user;
  }
}
