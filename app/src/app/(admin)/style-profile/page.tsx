import { notFound } from "next/navigation";

function decodeProfile(encoded: string) {
  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, string | null>;
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

export default async function StyleProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawProfile = Array.isArray(params.profile)
    ? params.profile[0]
    : params.profile;

  if (!rawProfile) {
    notFound();
  }

  const profile = decodeProfile(rawProfile);

  if (!profile) {
    notFound();
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
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
            <p className="text-theme-xs font-medium text-gray-500">Cores preferidas</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.colorsPreferred, "sem preferência")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Cores a evitar</p>
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
            <p className="text-theme-xs font-medium text-gray-500">Silhuetas</p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              {formatValue(profile.silhouettes, "sem preferência")}
            </p>
          </div>
          <div>
            <p className="text-theme-xs font-medium text-gray-500">Materiais</p>
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

      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          Salvar perfil (mock)
        </button>
        <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300">
          Ajustar no chat
        </button>
      </div>
    </div>
  );
}
