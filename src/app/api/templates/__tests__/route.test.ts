import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/auth", () => ({ auth: () => mockAuth() }));

// Mock prisma
const mockPrisma = {
  template: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// Import after mocks
const { GET, POST } = await import("../route");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns templates for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const templates = [{ id: "t1", name: "Test", title: "Test todo" }];
    mockPrisma.template.findMany.mockResolvedValue(templates);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(templates);
    expect(mockPrisma.template.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("POST /api/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ name: "Test", title: "Todo" }) as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ title: "Todo" }) as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("name");
  });

  it("returns 400 when title is missing", async () => {
    const res = await POST(makeRequest({ name: "Test" }) as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("title");
  });

  it("returns 400 for invalid priority", async () => {
    const res = await POST(
      makeRequest({ name: "Test", title: "Todo", priority: "critical" }) as never
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid priority");
  });

  it("returns 400 for invalid category", async () => {
    const res = await POST(
      makeRequest({ name: "Test", title: "Todo", category: "InvalidCat" }) as never
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid category");
  });

  it("accepts valid priority values", async () => {
    for (const priority of ["low", "medium", "high"]) {
      mockPrisma.template.create.mockResolvedValue({
        id: "t1",
        name: "Test",
        title: "Todo",
        priority,
      });
      const res = await POST(
        makeRequest({ name: "Test", title: "Todo", priority }) as never
      );
      expect(res.status).toBe(201);
    }
  });

  it("accepts valid category values", async () => {
    for (const category of ["Work", "Personal", "Shopping", "Health", "Other"]) {
      mockPrisma.template.create.mockResolvedValue({
        id: "t1",
        name: "Test",
        title: "Todo",
        category,
      });
      const res = await POST(
        makeRequest({ name: "Test", title: "Todo", category }) as never
      );
      expect(res.status).toBe(201);
    }
  });

  it("creates template with valid data", async () => {
    const created = {
      id: "t1",
      name: "Weekly Review",
      title: "Do weekly review",
      priority: "high",
      category: "Work",
      userId: "user-1",
    };
    mockPrisma.template.create.mockResolvedValue(created);

    const res = await POST(
      makeRequest({
        name: "  Weekly Review  ",
        title: "  Do weekly review  ",
        priority: "high",
        category: "Work",
      }) as never
    );

    expect(res.status).toBe(201);
    expect(mockPrisma.template.create).toHaveBeenCalledWith({
      data: {
        name: "Weekly Review",
        title: "Do weekly review",
        priority: "high",
        category: "Work",
        userId: "user-1",
      },
    });
  });

  it("defaults priority to medium when not provided", async () => {
    mockPrisma.template.create.mockResolvedValue({ id: "t1" });

    await POST(makeRequest({ name: "Test", title: "Todo" }) as never);

    expect(mockPrisma.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: "medium" }),
      })
    );
  });
});
