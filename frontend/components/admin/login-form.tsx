"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons/icon";
import { getMe, login, logout } from "@/lib/admin/api";
import { canAccessAdmin, isSafeAdminPath } from "@/lib/admin/types";
import { siteBrand } from "@/lib/site/navigation";

function destinationFromNext(raw: string | null): string {
  if (raw && isSafeAdminPath(raw)) {
    return raw;
  }
  return "/admin/depoimentos";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = useId();
  const identifierId = `${formId}-identifier`;
  const passwordId = `${formId}-password`;
  const errorId = `${formId}-error`;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = identifier.trim();
    if (trimmed.length === 0 || password.length === 0) {
      setError("Preencha usuário ou email e senha.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await login(trimmed, password);
      if (!result.ok) {
        if (result.error.status === 429) {
          setError("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
        } else if (result.error.code === "invalid_login" || result.error.status === 400) {
          setError("Usuário, email ou senha incorretos.");
        } else {
          setError("Não foi possível entrar. Tente de novo.");
        }
        return;
      }

      const me = await getMe();
      if (!canAccessAdmin(me)) {
        await logout();
        setError("Esta conta não tem acesso ao painel.");
        return;
      }

      router.replace(destinationFromNext(searchParams.get("next")));
    } catch {
      setError("Não foi possível entrar. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo.svg" alt="" width={72} height={72} priority />
          <p className="mt-3 text-label font-bold text-soil">{siteBrand}</p>
          <h1 className="mt-6 text-title font-bold text-ink-soft">Entrar no painel</h1>
        </div>

        <form
          className="rounded-xl border border-line bg-canvas px-6 py-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor={identifierId} className="text-label font-semibold text-text">
              Usuário ou email
            </label>
            <input
              id={identifierId}
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setError("");
              }}
              className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft"
            />
          </div>

          <div className="mt-4">
            <label htmlFor={passwordId} className="text-label font-semibold text-text">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="h-10 w-full rounded-lg border border-line bg-canvas px-2 pr-12 text-body text-ink-soft"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-sky"
              >
                {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
              </button>
            </div>
          </div>

          <p
            id={errorId}
            role={error ? "alert" : undefined}
            className="mt-3 min-h-6 text-sm font-semibold text-danger"
            aria-hidden={error ? undefined : true}
          >
            {error}
          </p>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-5 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
