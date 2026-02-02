"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image, { type ImageLoader } from "next/image";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { WardrobeItem } from "@/lib/contracts/wardrobe";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

const emptyStateClasses =
  "rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400";

const passthroughLoader: ImageLoader = ({ src }) => src;
const seasonLabels: Record<string, string> = {
  verao: "Verao",
  inverno: "Inverno",
  "meia-estacao": "Meia estacao",
  todas: "Todas",
};

export default function WardrobeList() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const previewModal = useModal();

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.category,
        item.color,
        item.material,
        item.season ?? "",
        item.notes ?? "",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [items, search]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/wardrobe");

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nao foi possivel carregar as pecas.");
          setItems([]);
          return;
        }

        const data = await response.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setError("Nao foi possivel carregar as pecas.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja remover esta peca?"
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/wardrobe/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Nao foi possivel remover a peca.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Nao foi possivel remover a peca.");
    } finally {
      setDeletingId(null);
    }
  };

  const openPreview = (item: WardrobeItem) => {
    if (!item.imageUrl) {
      return;
    }
    setSelectedItem(item);
    previewModal.openModal();
  };

  const closePreview = () => {
    previewModal.closeModal();
    setSelectedItem(null);
  };

  return (
    <>
      <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Pecas cadastradas
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie as pecas do seu guarda-roupa.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por categoria, cor ou tag"
                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-700 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <Link
              href="/wardrobe/new"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              Adicionar peca
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-2 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="mt-4 max-w-full overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Carregando pecas...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={emptyStateClasses}>
              {items.length === 0
                ? "Nenhuma peca cadastrada ainda."
                : "Nenhuma peca encontrada para a busca."}
            </div>
          ) : (
            <Table>
              <TableHeader className="border-gray-100 border-y dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Peca
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Cor
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Material
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Estacao
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tags
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Acoes
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item) => {
                  const visibleTags = item.tags.slice(0, 3);
                  const remainingTags = item.tags.length - visibleTags.length;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openPreview(item)}
                            disabled={!item.imageUrl}
                            className={`group relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${
                              item.imageUrl ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            {item.imageUrl ? (
                              <>
                                <Image
                                  loader={passthroughLoader}
                                  unoptimized
                                  src={item.imageUrl}
                                  alt={item.category}
                                  width={48}
                                  height={48}
                                  sizes="48px"
                                  className="h-full w-full object-cover"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-gray-900/40 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                  Ver
                                </span>
                              </>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                                Sem foto
                              </div>
                            )}
                          </button>
                          <div>
                            <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                              {item.category}
                            </p>
                            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                              {item.material}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {item.color}
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {item.material}
                      </TableCell>
                      <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {item.season
                          ? seasonLabels[item.season] ?? item.season
                          : "Nao informado"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {visibleTags.length === 0 && (
                            <span className="text-theme-xs text-gray-400">
                              Sem tags
                            </span>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge key={tag} size="sm" color="light">
                              {tag}
                            </Badge>
                          ))}
                          {remainingTags > 0 && (
                            <Badge size="sm" color="light">
                              +{remainingTags}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openPreview(item)}
                            disabled={!item.imageUrl}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                          >
                            Visualizar
                          </button>
                          <Link
                            href={`/wardrobe/${item.id}/edit`}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-error-600 transition hover:bg-error-50 disabled:cursor-not-allowed dark:text-error-400"
                          >
                            {deletingId === item.id ? "Removendo..." : "Remover"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      </div>
      <Modal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        className="max-w-[720px] m-4"
      >
        <div className="p-6 sm:p-8">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {selectedItem?.category ?? "Visualizar peca"}
            </h4>
            {selectedItem && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedItem.color} · {selectedItem.material}
              </p>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            {selectedItem?.imageUrl ? (
            <Image
              loader={passthroughLoader}
              unoptimized
              src={selectedItem.imageUrl}
              alt={selectedItem.category}
              width={1200}
              height={1200}
              sizes="(max-width: 768px) 90vw, 720px"
              className="max-h-[70vh] w-full object-contain"
            />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Sem imagem
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
