import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import validate from "./validate.js";
import { Request, Response, NextFunction } from "express";

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(3),
    age: z.number().int().positive(),
  });

  it("calls next() and overwrites req.body when input is valid", async () => {
    const middleware = validate({ schema, source: "body" });
    const req = { body: { name: "alice", age: 30 } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: "alice", age: 30 });
  });

  it("responds with 400 and the first error message when input is invalid", async () => {
    const middleware = validate({ schema, source: "body" });
    const req = { body: { name: "ab", age: -1 } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("validates from req.params when source is 'params'", async () => {
    const paramsSchema = z.object({ id: z.string().regex(/^\d+$/) });
    const middleware = validate({ schema: paramsSchema, source: "params" });
    const req = { params: { id: "abc" } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards non-Zod errors to next(err)", async () => {
    const failingSchema = {
      parseAsync: vi.fn().mockRejectedValue(new Error("boom")),
    } as unknown as z.ZodSchema;
    const middleware = validate({ schema: failingSchema, source: "body" });
    const req = { body: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
