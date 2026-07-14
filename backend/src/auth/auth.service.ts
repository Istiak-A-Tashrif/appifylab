import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./auth.dto";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } }))
      throw new ConflictException("Email is already registered");
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        passwordHash: await hash(dto.password, 12),
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    return { user, tokens: await this.issueTokens(user.id) };
  }

  async login(dto: LoginDto) {
    const record = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!record || !(await compare(dto.password, record.passwordHash)))
      throw new UnauthorizedException("Invalid email or password");
    const user = {
      id: record.id,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
    };
    return { user, tokens: await this.issueTokens(user.id) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefresh(refreshToken);
    const oldHash = this.tokenHash(refreshToken);
    const tokens = await this.createTokens(payload.sub);
    const rotated = await this.prisma.user.updateMany({
      where: { id: payload.sub, refreshTokenHash: oldHash },
      data: { refreshTokenHash: this.tokenHash(tokens.refreshToken) },
    });
    
    if (rotated.count !== 1)
      throw new UnauthorizedException(
        "Refresh token has been rotated or revoked",
      );
    return tokens;
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.verifyRefresh(refreshToken);
      await this.prisma.user.updateMany({
        where: {
          id: payload.sub,
          refreshTokenHash: this.tokenHash(refreshToken),
        },
        data: { refreshTokenHash: null },
      });
    } catch {
      /* Expired or invalid tokens still have their cookies cleared. */
    }
  }

  async session(refreshToken: string) {
    const payload = await this.verifyRefresh(refreshToken);
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        refreshTokenHash: this.tokenHash(refreshToken),
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!user) throw new UnauthorizedException("Invalid refresh token");
    return user;
  }

  private async issueTokens(userId: string): Promise<TokenPair> {
    const tokens = await this.createTokens(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: this.tokenHash(tokens.refreshToken) },
    });
    return tokens;
  }

  private async createTokens(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: userId }, { expiresIn: "15m" }),
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.getOrThrow("JWT_REFRESH_SECRET"),
          expiresIn: "7d",
          jwtid: randomUUID(),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private verifyRefresh(token: string) {
    return this.jwt
      .verifyAsync<{
        sub: string;
      }>(token, { secret: this.config.getOrThrow("JWT_REFRESH_SECRET") })
      .catch(() => {
        throw new UnauthorizedException("Invalid refresh token");
      });
  }

  private tokenHash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}
