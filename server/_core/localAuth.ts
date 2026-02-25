/**
 * Local Authentication System
 * Substitui o Manus OAuth por autenticação local com usuário/senha.
 * Usa JWT para sessões (compatível com o sistema existente do sdk.ts).
 */

import type { Express, Request, Response } from "express";
import { hashPassword, verifyPassword } from "./bcryptWrapper";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function registerLocalAuthRoutes(app: Express) {
  // ─── Página de Login ────────────────────────────────────────────────────────
  app.get("/login", (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cultivo — Login</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1a1f2e;
      border: 1px solid #2d3748;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 380px;
    }
    .logo { font-size: 2rem; text-align: center; margin-bottom: 0.5rem; }
    h1 { text-align: center; font-size: 1.25rem; color: #a0aec0; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.875rem; color: #a0aec0; margin-bottom: 0.25rem; }
    input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: #0f1117;
      border: 1px solid #2d3748;
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 1rem;
      margin-bottom: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #4ade80; }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #15803d; }
    .error {
      background: #7f1d1d;
      border: 1px solid #991b1b;
      color: #fca5a5;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .register-link {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #718096;
    }
    .register-link a { color: #4ade80; text-decoration: none; }
    .register-link a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🌱</div>
    <h1>App Cultivo</h1>
    <form method="POST" action="/api/auth/login">
      <div id="error-msg" style="display:none" class="error"></div>
      <label for="username">Usuário</label>
      <input type="text" id="username" name="username" placeholder="seu_usuario" required autofocus />
      <label for="password">Senha</label>
      <input type="password" id="password" name="password" placeholder="••••••••" required />
      <button type="submit">Entrar</button>
    </form>
    <div class="register-link">
      Não tem conta? <a href="/register">Criar conta</a>
    </div>
  </div>
</body>
</html>`);
  });

  // ─── Página de Registro ─────────────────────────────────────────────────────
  app.get("/register", (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cultivo — Criar Conta</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1a1f2e;
      border: 1px solid #2d3748;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 380px;
    }
    .logo { font-size: 2rem; text-align: center; margin-bottom: 0.5rem; }
    h1 { text-align: center; font-size: 1.25rem; color: #a0aec0; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.875rem; color: #a0aec0; margin-bottom: 0.25rem; }
    input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: #0f1117;
      border: 1px solid #2d3748;
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 1rem;
      margin-bottom: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #4ade80; }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #15803d; }
    .error {
      background: #7f1d1d;
      border: 1px solid #991b1b;
      color: #fca5a5;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .login-link {
      text-align: center;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #718096;
    }
    .login-link a { color: #4ade80; text-decoration: none; }
    .login-link a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🌱</div>
    <h1>Criar Conta</h1>
    <form method="POST" action="/api/auth/register">
      <label for="username">Usuário</label>
      <input type="text" id="username" name="username" placeholder="seu_usuario" required autofocus />
      <label for="name">Nome (opcional)</label>
      <input type="text" id="name" name="name" placeholder="Seu Nome" />
      <label for="email">Email (opcional)</label>
      <input type="email" id="email" name="email" placeholder="email@exemplo.com" />
      <label for="password">Senha</label>
      <input type="password" id="password" name="password" placeholder="••••••••" required minlength="6" />
      <label for="confirmPassword">Confirmar Senha</label>
      <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required minlength="6" />
      <button type="submit">Criar Conta</button>
    </form>
    <div class="login-link">
      Já tem conta? <a href="/login">Entrar</a>
    </div>
  </div>
</body>
</html>`);
  });

  // ─── API: Login ─────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.redirect("/login?error=Usuário+e+senha+são+obrigatórios");
    }

    try {
      const user = await db.getUserByOpenId(username.trim().toLowerCase());

      if (!user || !user.password) {
        return res.redirect("/login?error=Usuário+ou+senha+inválidos");
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return res.redirect("/login?error=Usuário+ou+senha+inválidos");
      }

      // Cria sessão JWT usando o sistema existente do sdk.ts
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.openId,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Atualiza lastSignedIn
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      return res.redirect(302, "/");
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      return res.redirect("/login?error=Erro+interno+ao+fazer+login");
    }
  });

  // ─── API: Registro ──────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, name, email, password, confirmPassword } = req.body;

    if (!username || !password) {
      return res.redirect("/register?error=Usuário+e+senha+são+obrigatórios");
    }

    if (password !== confirmPassword) {
      return res.redirect("/register?error=As+senhas+não+coincidem");
    }

    if (password.length < 6) {
      return res.redirect("/register?error=A+senha+deve+ter+pelo+menos+6+caracteres");
    }

    const openId = username.trim().toLowerCase();

    try {
      const existing = await db.getUserByOpenId(openId);
      if (existing) {
        return res.redirect("/register?error=Usuário+já+existe");
      }

      const hashedPassword = await hashPassword(password);

      await db.upsertUser({
        openId,
        password: hashedPassword,
        name: name?.trim() || null,
        email: email?.trim() || null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      // Faz login automaticamente após registro
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name?.trim() || openId,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.redirect(302, "/");
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      return res.redirect("/register?error=Erro+interno+ao+criar+conta");
    }
  });

  // ─── API: Logout ─────────────────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.redirect(302, "/login");
  });

  app.get("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.redirect(302, "/login");
  });

  console.log("[LocalAuth] Rotas de autenticação local registradas: /login, /register, /api/auth/*");
}
