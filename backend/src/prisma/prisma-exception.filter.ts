import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({ statusCode: 400, message: "Invalid database request" });
    }

    const mapped: Record<string, { status: number; message: string }> = {
      P2002: { status: HttpStatus.CONFLICT, message: "A record with that value already exists" },
      P2003: { status: HttpStatus.CONFLICT, message: "This operation conflicts with a related record" },
      P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
    };
    const error = mapped[exception.code];
    if (error) return response.status(error.status).json({ statusCode: error.status, message: error.message });

    this.logger.error(`Unhandled Prisma error ${exception.code}`, exception.stack);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: 500, message: "Database operation failed" });
  }
}
