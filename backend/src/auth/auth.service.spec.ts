import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  passwordHash: "$2b$12$invalid",
};

describe("AuthService", () => {
  let prisma: any;
  let jwt: any;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    };
    jwt = {
      signAsync: vi
        .fn()
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token"),
      verifyAsync: vi.fn(),
    };
    const config = { getOrThrow: vi.fn((key: string) => key) };
    service = new AuthService(prisma, jwt, config as never);
  });

  it("normalizes email, hashes the password, and stores only a refresh-token hash", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ ...user, passwordHash: undefined });
    prisma.user.update.mockResolvedValue(user);
    const result = await service.register({
      firstName: " Ada ",
      lastName: " Lovelace ",
      email: "ADA@EXAMPLE.COM",
      password: "correct-horse",
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ada@example.com",
          firstName: "Ada",
          lastName: "Lovelace",
          passwordHash: expect.not.stringContaining("correct-horse"),
        }),
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { refreshTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) },
      }),
    );
    expect(result.tokens).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("rejects a duplicate registration", async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    await expect(
      service.register({
        firstName: "Ada",
        lastName: "Lovelace",
        email: user.email,
        password: "correct-horse",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("does not reveal whether a login email exists", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({
        email: "missing@example.com",
        password: "correct-horse",
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: "Invalid email or password",
      }),
    });
  });

  it("atomically rotates a valid refresh token", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: user.id });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    await expect(service.refresh("old-refresh-token")).resolves.toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: user.id,
          refreshTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        },
      }),
    );
  });

  it("rejects a replayed or revoked refresh token", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: user.id });
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.refresh("replayed-token")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
