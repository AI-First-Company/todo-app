import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

// In-memory user store for MVP
const users = new Map<string, User>();

export function getUserByEmail(email: string): User | undefined {
  for (const user of users.values()) {
    if (user.email === email) return user;
  }
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<User> {
  if (getUserByEmail(email)) {
    throw new Error("User already exists");
  }
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = { id, email, name, passwordHash };
  users.set(id, user);
  return user;
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
