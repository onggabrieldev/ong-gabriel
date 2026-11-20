import { adminFetch, parseApiError } from "@/lib/admin/api";
import {
  type AdminGalleryAlbum,
  type AdminGalleryPhoto,
  AdminRequestError,
} from "@/lib/admin/types";

const albumsPath = "/api/v1/admin/gallery/";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function invalidResponse(): AdminRequestError {
  return new AdminRequestError({
    message: "Resposta inválida do servidor.",
    fields: {},
    status: 500,
    code: null,
  });
}

function parseAlbum(value: unknown): AdminGalleryAlbum | null {
  if (!isRecord(value)) {
    return null;
  }
  const {
    id,
    slug,
    title,
    summary,
    event_type,
    location,
    held_on,
    cover,
    cover_alt,
    photo_count,
    is_published,
    created_at,
    updated_at,
  } = value;
  if (
    typeof id !== "string" ||
    typeof slug !== "string" ||
    typeof title !== "string" ||
    typeof summary !== "string" ||
    typeof event_type !== "string" ||
    typeof location !== "string" ||
    typeof held_on !== "string" ||
    typeof cover !== "string" ||
    typeof cover_alt !== "string" ||
    !isCount(photo_count) ||
    typeof is_published !== "boolean" ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }

  return {
    id,
    slug,
    title,
    summary,
    event_type,
    location,
    held_on,
    cover,
    cover_alt,
    photo_count,
    is_published,
    created_at,
    updated_at,
  };
}

function parsePhoto(value: unknown): AdminGalleryPhoto | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, image, image_alt, width, height, position, created_at, updated_at } = value;
  if (
    typeof id !== "string" ||
    typeof image !== "string" ||
    typeof image_alt !== "string" ||
    !isCount(width) ||
    !isCount(height) ||
    !isCount(position) ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }
  return { id, image, image_alt, width, height, position, created_at, updated_at };
}

function parseList<T>(value: unknown, parse: (entry: unknown) => T | null): T[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: T[] = [];
  for (const entry of value) {
    const item = parse(entry);
    if (item === null) {
      return null;
    }
    items.push(item);
  }
  return items;
}

async function read<T>(
  response: Response,
  fallback: string,
  parse: (value: unknown) => T | null,
): Promise<T> {
  if (!response.ok) {
    throw new AdminRequestError(await parseApiError(response, fallback));
  }
  const item = parse(await response.json());
  if (item === null) {
    throw invalidResponse();
  }
  return item;
}

async function expectDeleted(response: Response, fallback: string): Promise<void> {
  if (!response.ok && response.status !== 204) {
    throw new AdminRequestError(await parseApiError(response, fallback));
  }
}

function photosPath(albumId: string): string {
  return `${albumsPath}${albumId}/photos/`;
}

export async function listAlbums(): Promise<AdminGalleryAlbum[]> {
  const response = await adminFetch(albumsPath);
  return read(response, "Não foi possível carregar a galeria.", (value) =>
    parseList(value, parseAlbum),
  );
}

export type AlbumWriteInput = {
  title: string;
  summary: string;
  eventType: string;
  location: string;
  // "YYYY-MM-DD".
  heldOn: string;
  coverAlt: string;
  isPublished: boolean;
  coverFile: File | null;
};

function toFormData(input: AlbumWriteInput): FormData {
  const data = new FormData();
  data.set("title", input.title);
  data.set("summary", input.summary);
  data.set("event_type", input.eventType);
  data.set("location", input.location);
  data.set("held_on", input.heldOn);
  data.set("cover_alt", input.coverAlt);
  data.set("is_published", input.isPublished ? "true" : "false");
  if (input.coverFile) {
    data.set("cover", input.coverFile);
  }
  return data;
}

export async function createAlbum(input: AlbumWriteInput): Promise<AdminGalleryAlbum> {
  const response = await adminFetch(albumsPath, { method: "POST", body: toFormData(input) });
  return read(response, "Não foi possível criar o álbum.", parseAlbum);
}

export async function updateAlbum(id: string, input: AlbumWriteInput): Promise<AdminGalleryAlbum> {
  const response = await adminFetch(`${albumsPath}${id}/`, {
    method: "PATCH",
    body: toFormData(input),
  });
  return read(response, "Não foi possível salvar o álbum.", parseAlbum);
}

export async function patchAlbumPublished(
  id: string,
  isPublished: boolean,
): Promise<AdminGalleryAlbum> {
  const response = await adminFetch(`${albumsPath}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_published: isPublished }),
  });
  return read(response, "Não foi possível atualizar a publicação.", parseAlbum);
}

export async function deleteAlbum(id: string): Promise<void> {
  const response = await adminFetch(`${albumsPath}${id}/`, { method: "DELETE" });
  await expectDeleted(response, "Não foi possível apagar o álbum.");
}

export async function listPhotos(albumId: string): Promise<AdminGalleryPhoto[]> {
  const response = await adminFetch(photosPath(albumId));
  return read(response, "Não foi possível carregar as fotos.", (value) =>
    parseList(value, parsePhoto),
  );
}

export async function uploadPhoto(
  albumId: string,
  file: File,
  imageAlt: string,
): Promise<AdminGalleryPhoto> {
  const data = new FormData();
  data.set("image", file);
  data.set("image_alt", imageAlt);
  const response = await adminFetch(photosPath(albumId), { method: "POST", body: data });
  return read(response, "Não foi possível enviar a foto.", parsePhoto);
}

export async function updatePhotoAlt(
  albumId: string,
  photoId: string,
  imageAlt: string,
): Promise<AdminGalleryPhoto> {
  const response = await adminFetch(`${photosPath(albumId)}${photoId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_alt: imageAlt }),
  });
  return read(response, "Não foi possível salvar a descrição.", parsePhoto);
}

export async function deletePhoto(albumId: string, photoId: string): Promise<void> {
  const response = await adminFetch(`${photosPath(albumId)}${photoId}/`, { method: "DELETE" });
  await expectDeleted(response, "Não foi possível apagar a foto.");
}

export async function reorderPhotos(
  albumId: string,
  ids: readonly string[],
): Promise<AdminGalleryPhoto[]> {
  const response = await adminFetch(`${photosPath(albumId)}reorder/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return read(response, "Não foi possível reordenar as fotos.", (value) =>
    parseList(value, parsePhoto),
  );
}
