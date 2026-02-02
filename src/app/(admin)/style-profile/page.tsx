"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { StyleProfile } from "@/lib/contracts/style-profile";

function decodeProfile(encoded: string) {
  try {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json) as StyleProfile;
  } catch {
    return null;
  }
}

function formatValue(value: string | null | undefined, fallback: string) {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  return value;
}

function formatWardrobeMode(value: StyleProfile["wardrobeMode"]) {
  if (!value) {
    return "não informado";
  }
  return value === "capsula" ? "cápsula" : "livre";
}

export default function StyleProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawProfile = searchParams.get("profile");

  const decodedProfile = useMemo(
    () => (rawProfile ? decodeProfile(rawProfile) : null),
    [rawProfile]
  );

  const [profile, setProfile] = useState<StyleProfile | null>(decodedProfile);
  const [loading, setLoading] = useState(!decodedProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (decodedProfile) {
      setProfile(decodedProfile);
      setLoading(false);
      setSaved(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/style-profile");
        if (!response.ok) {
          throw new Error("Falha ao carregar perfil");
        }
        const data = (await response.json()) as { profile: StyleProfile | null };
        if (isMounted) {
          setProfile(data.profile ?? null);
          setSaved(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Falha ao carregar perfil"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [decodedProfile]);

  const handleSave = async () => {
    if (!profile || saving) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/style-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.error ?? "Nao foi possivel salvar o perfil";
        throw new Error(message);
      }

      const data = (await response.json()) as { profile: StyleProfile | null };
      setProfile(data.profile ?? profile);
      setSaved(true);
      if (rawProfile) {
        router.replace("/style-profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar perfil");
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-brand-500">Perfil de estilo</p>
          <h1 className="text-title-lg font-bold text-gray-800 dark:text-white/90">
            Carregando perfil
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Aguarde um instante.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-brand-500">Perfil de estilo</p>
          <h1 className="text-title-lg font-bold text-gray-800 dark:text-white/90">
            Nenhum perfil gerado ainda
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Para ver o resumo, finalize o chat de estilo primeiro.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ir para o chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-500">Perfil de estilo</p>
        <h1 className="text-title-lg font-bold text-gray-800 dark:text-white/90">
          Seu resumo inicial
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Revise as informações antes de salvar. Você poderá editar depois.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Percepção</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.perception, "não informado")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Estilos</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.styles, "não informado")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">
              Cores preferidas
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.colorsPreferred, "sem preferência")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">
              Cores a evitar
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.colorsAvoid, "sem preferência")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Ocasiões</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.occasions, "não informado")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Formalidade</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.formality, "não informado")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">
              Modo de guarda-roupa
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatWardrobeMode(profile.wardrobeMode)}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">
              Silhuetas
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.silhouettes, "sem preferência")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">
              Materiais
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.materials, "sem preferência")}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-theme-xs font-medium text-gray-500">Evita</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.avoidPieces, "sem preferência")}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger-500">{error}</p>
      ) : saved ? (
        <p className="text-sm text-success-600">Perfil salvo com sucesso.</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
        <Link
          href="/chat"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300"
        >
          Ajustar no chat
        </Link>
      </div>
    </div>
  );
}
