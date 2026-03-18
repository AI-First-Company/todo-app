import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    template: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { DELETE } from "../[id]/route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = vi.mocked(auth);
const mockedFindUnique = vi.mocked(prisma.template.findUnique);
const mockedDelete = vi.mocked(prisma.template.delete);

function makeRequest() {
  return new Request("http://localhost/api/templates/tmpl-1", {
    method: "DELETE",
  });
}

function makeParams(id = "tmpl-1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/templates/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeRequest(), makeParams());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when template does not exist", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    mockedFindUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest(), makeParams());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  it("returns 404 when template belongs to another user", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    mockedFindUnique.mockResolvedValue({
      id: "tmpl-1",
      userId: "user-other",
      name: "Test",
      title: "Test",
      priority: "medium",
      category: null,
      createdAt: new Date(),
    } as any);

    const res = await DELETE(makeRequest(), makeParams());
    expect(res.status).toBe(404);
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("deletes template and returns 204 when authorized owner", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } } as any);
    mockedFindUnique.mockResolvedValue({
      id: "tmpl-1",
      userId: "user-1",
      name: "Test",
      title: "Test",
      priority: "medium",
      category: null,
      createdAt: new Date(),
    } as any);
    mockedDelete.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest(), makeParams());
    expect(res.status).toBe(204);
    expect(mockedDelete).toHaveBeenCalledWith({ where: { id: "tmpl-1" } });
  });
});
