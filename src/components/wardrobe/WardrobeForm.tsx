"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Image, { type ImageLoader } from "next/image";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { wardrobeItemCreateSchema } from "@/lib/contracts/wardrobe";
import type { WardrobeItem } from "@/lib/contracts/wardrobe";

const initialState = {
  category: "",
  color: "",
  material: "",
  season: "",
  notes: "",
  imageUrl: "",
  tags: "",
};

type FieldErrors = Record<string, string | undefined>;

type WardrobeFormProps = {
  mode: "create" | "edit";
  itemId?: string;
};

const passthroughLoader: ImageLoader = ({ src }) => src;

function normalizeOptionalField(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function WardrobeForm({ mode, itemId }: WardrobeFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (mode !== "edit" || !itemId) {
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/wardrobe/${itemId}`);

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nao foi possivel carregar a peca.");
          return;
        }

        const data = (await response.json()) as { item?: WardrobeItem };
        if (!data?.item) {
          setError("Nao foi possivel carregar a peca.");
          return;
        }

        setFormState({
          category: data.item.category,
          color: data.item.color,
          material: data.item.material,
          season: data.item.season ?? "",
          notes: data.item.notes ?? "",
          imageUrl: data.item.imageUrl ?? "",
          tags: data.item.tags.join(", "),
        });
      } catch {
        setError("Nao foi possivel carregar a peca.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [mode, itemId]);

  const handleChange = (field: keyof typeof initialState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);
    setError(null);
    setAiNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/wardrobe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setUploadError(data?.error ?? "Falha ao enviar a imagem.");
        return;
      }

      const data = (await response.json()) as { publicUrl?: string };
      const publicUrl = data.publicUrl;
      if (!publicUrl) {
        setUploadError("Falha ao receber a URL da imagem.");
        return;
      }

      setFormState((current) => ({ ...current, imageUrl: publicUrl }));
    } catch {
      setUploadError("Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleAiSubmit = async () => {
    if (!formState.imageUrl) {
      setError("Envie uma foto para usar o preenchimento com IA.");
      return;
    }

    setAiSubmitting(true);
    setError(null);
    setAiNotice(null);

    try {
      const response = await fetch("/api/wardrobe/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: formState.imageUrl,
          notes: normalizeOptionalField(formState.notes),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Nao foi possivel gerar com IA.");
        return;
      }

      const data = (await response.json()) as {
        draft?: {
          category: string;
          color: string;
          material: string;
          season?: string | null;
          notes?: string | null;
          imageUrl?: string | null;
          tags?: string[];
        };
      };

      const draft = data?.draft;
      if (!draft) {
        setError("Nao foi possivel gerar o cadastro com IA.");
        return;
      }

      setFormState((current) => ({
        ...current,
        category: draft.category ?? current.category,
        color: draft.color ?? current.color,
        material: draft.material ?? current.material,
        season: draft.season ?? "",
        notes: draft.notes ?? current.notes,
        imageUrl: draft.imageUrl ?? current.imageUrl,
        tags: draft.tags?.join(", ") ?? "",
      }));
      setFieldErrors({});
      setAiNotice("Sugestao da IA aplicada. Revise e salve a peca.");
    } catch {
      setError("Nao foi possivel gerar com IA.");
    } finally {
      setAiSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setAiNotice(null);
    setFieldErrors({});

    const payload = {
      category: formState.category,
      color: formState.color,
      material: formState.material,
      season: normalizeOptionalField(formState.season),
      notes: normalizeOptionalField(formState.notes),
      imageUrl: normalizeOptionalField(formState.imageUrl),
      tags: parseTags(formState.tags),
    };

    const parsed = wardrobeItemCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const nextErrors: FieldErrors = {};
      Object.entries(flattened).forEach(([key, value]) => {
        if (value && value.length > 0) {
          nextErrors[key] = value[0];
        }
      });
      setFieldErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        mode === "create" ? "/api/wardrobe/manual" : `/api/wardrobe/${itemId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Nao foi possivel salvar a peca.");
        return;
      }

      router.push("/wardrobe");
      router.refresh();
    } catch {
      setError("Nao foi possivel salvar a peca.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Carregando dados da peca...
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ComponentCard
            title="Detalhes da peca"
            desc="Informe as caracteristicas principais da peca."
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  placeholder="Ex: Camisa, Calca, Tenis"
                  value={formState.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value)
                  }
                  error={Boolean(fieldErrors.category)}
                  hint={fieldErrors.category}
                />
              </div>
              <div>
                <Label htmlFor="color">Cor principal *</Label>
                <Input
                  id="color"
                  placeholder="Ex: Azul marinho"
                  value={formState.color}
                  onChange={(event) => handleChange("color", event.target.value)}
                  error={Boolean(fieldErrors.color)}
                  hint={fieldErrors.color}
                />
              </div>
              <div>
                <Label htmlFor="material">Material *</Label>
                <Input
                  id="material"
                  placeholder="Ex: Algodao, Linho"
                  value={formState.material}
                  onChange={(event) =>
                    handleChange("material", event.target.value)
                  }
                  error={Boolean(fieldErrors.material)}
                  hint={fieldErrors.material}
                />
              </div>
              <div>
                <Label htmlFor="season">Estacao</Label>
                <div className="relative">
                  <select
                    id="season"
                    value={formState.season}
                    onChange={(event) =>
                      handleChange("season", event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Selecione</option>
                    <option value="verao">Verao</option>
                    <option value="inverno">Inverno</option>
                    <option value="meia-estacao">Meia estacao</option>
                    <option value="todas">Todas</option>
                  </select>
                  {fieldErrors.season && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {fieldErrors.season}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="casual, trabalho, noite"
                  value={formState.tags}
                  onChange={(event) => handleChange("tags", event.target.value)}
                  error={Boolean(fieldErrors.tags)}
                  hint={fieldErrors.tags ?? "Separe por virgula"}
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard
            title="Notas"
            desc="Detalhes extras para facilitar combinacoes futuras."
          >
            <TextArea
              rows={5}
              placeholder="Ex: Prefiro usar com blazer ou em dias frios"
              value={formState.notes}
              onChange={(value) => handleChange("notes", value)}
              error={Boolean(fieldErrors.notes)}
              hint={fieldErrors.notes}
            />
          </ComponentCard>
        </div>

        <div className="space-y-6">
          <ComponentCard
            title="Foto da peca"
            desc="Envie uma foto ou tire na hora pelo celular."
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageFile">Imagem</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600"
                />
                {uploading && (
                  <p className="mt-2 text-xs text-gray-500">
                    Enviando imagem...
                  </p>
                )}
                {uploadError && (
                  <p className="mt-2 text-xs text-error-600">{uploadError}</p>
                )}
              </div>
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
                {formState.imageUrl ? (
                  <Image
                    loader={passthroughLoader}
                    unoptimized
                    src={formState.imageUrl}
                    alt="Preview da peca"
                    width={420}
                    height={420}
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  "Sem preview"
                )}
              </div>
              {formState.imageUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setFormState((current) => ({ ...current, imageUrl: "" }))
                  }
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Remover imagem
                </button>
              )}
            </div>
          </ComponentCard>

          <ComponentCard
            title="Resumo"
            desc="Revise antes de salvar."
          >
            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Categoria:
                </span>{" "}
                {formState.category || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Cor:
                </span>{" "}
                {formState.color || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Material:
                </span>{" "}
                {formState.material || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Tags:
                </span>{" "}
                {formState.tags || "-"}
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>

      {aiNotice && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-200">
          {aiNotice}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-2 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {mode === "create" && (
          <Button
            size="md"
            type="button"
            variant="outline"
            onClick={handleAiSubmit}
            disabled={aiSubmitting || uploading || !formState.imageUrl}
          >
            {aiSubmitting ? "Gerando com IA..." : "Preencher com IA"}
          </Button>
        )}
        <Button
          size="md"
          type="submit"
          className="min-w-[160px]"
          disabled={submitting || uploading || aiSubmitting}
        >
          {submitting
            ? "Salvando..."
            : mode === "create"
            ? "Salvar peca"
            : "Atualizar peca"}
        </Button>
        <Button
          size="md"
          type="button"
          variant="outline"
          onClick={() => router.push("/wardrobe")}
        >
          Cancelar
        </Button>
      </div>
    </Form>
  );
}
