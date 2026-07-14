import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import cookieParser = require("cookie-parser");
import helmet from "helmet";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma/prisma-exception.filter";

const CSRF_COOKIE = "csrf_signature";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const signCsrf = (token: string, secret: string) =>
  createHmac("sha256", secret).update(token).digest("base64url");

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const production = config.get("NODE_ENV") === "production";
  const csrfSecret =
    config.get<string>("CSRF_SECRET") ??
    config.getOrThrow<string>("JWT_REFRESH_SECRET");
  app.disable("x-powered-by");
  app.setGlobalPrefix("api/v1");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.enableCors({
    origin: config.get("FRONTEND_URL", "http://localhost:5173"),
    credentials: true,
    methods: ["GET", "HEAD", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    optionsSuccessStatus: 204,
  });
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const request = req as Request & { csrfToken: () => string };
    request.csrfToken = () => {
      const token = randomBytes(32).toString("base64url");
      res.cookie(CSRF_COOKIE, signCsrf(token, csrfSecret), {
        httpOnly: true,
        sameSite: "lax",
        secure: production,
        path: "/",
      });
      return token;
    };
    if (SAFE_METHODS.has(req.method)) return next();
    const token = req.get(CSRF_HEADER);
    const signature = req.cookies?.[CSRF_COOKIE];
    if (!token || !signature)
      return res.status(403).json({ message: "Invalid CSRF token" });
    const expected = Buffer.from(signCsrf(token, csrfSecret));
    const actual = Buffer.from(String(signature));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      return res.status(403).json({ message: "Invalid CSRF token" });
    return next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();
  const port = config.get("PORT", 3000);
  await app.listen(port);
  logger.log(`Application running at ${await app.getUrl()}/api/v1`);
  logger.log(`Environment: ${config.get("NODE_ENV", "development")}`);
}
void bootstrap();
