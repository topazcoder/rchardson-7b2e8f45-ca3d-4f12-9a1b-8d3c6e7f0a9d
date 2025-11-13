import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from 'libs/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'secretKey'),
    });
  }

  async validate(payload: JwtPayload) {
    // payload contains id, username, role and optional organizationId
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
