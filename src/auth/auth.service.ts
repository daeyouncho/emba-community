import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

const JWT_SECRET = 'emba-super-secret-jwt-key-2024';
const JWT_REFRESH_SECRET = 'emba-refresh-secret-2024';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.generateTokens(user.id, user.email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    if (!user.isActive) throw new UnauthorizedException('비활성화된 계정입니다.');
    return {
      ...this.generateTokens(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: '7d' }),
      refreshToken: this.jwtService.sign(payload, { secret: JWT_REFRESH_SECRET, expiresIn: '30d' }),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: JWT_REFRESH_SECRET });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }
  }
}
