import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  private cookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: this.config.get("NODE_ENV") === "production",
      maxAge,
      path: "/",
    };
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie(
      "access_token",
      tokens.accessToken,
      this.cookieOptions(15 * 60_000),
    );
    res.cookie(
      "refresh_token",
      tokens.refreshToken,
      this.cookieOptions(7 * 86_400_000),
    );
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setCookies(res, result.tokens);
    return result.user;
  }

  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000, blockDuration: 60_000 } })
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    this.setCookies(res, result.tokens);
    return result.user;
  }

  @HttpCode(204)
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.refresh(req.cookies?.refresh_token ?? "");
    this.setCookies(res, tokens);
  }

  @HttpCode(204)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh_token);
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }

  @UseGuards(AuthGuard("jwt")) @Get("me") me(
    @Req() req: Request & { user: unknown },
  ) {
    return req.user;
  }

  @Get("csrf-token")
  csrfToken(@Req() req: Request & { csrfToken: () => string }) {
    return { csrfToken: req.csrfToken() };
  }
}
