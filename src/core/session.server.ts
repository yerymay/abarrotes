import {
  useSession as createServerSession,
  updateSession,
  clearSession,
} from "@tanstack/react-start/server";

export type SessionData = { userId?: string };

export function getSessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return {
    password,
    name: "bodega-session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getAppSession() {
  return createServerSession<SessionData>(getSessionConfig());
}

export async function startSession(userId: string) {
  await updateSession<SessionData>(getSessionConfig(), { userId });
}

export async function endSession() {
  await clearSession(getSessionConfig());
}
