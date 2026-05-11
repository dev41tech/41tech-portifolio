import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { Technology } from "./generated/api.schemas";

// ---------------------------------------------------------------------------
// Project Technologies
// ---------------------------------------------------------------------------

export const getProjectTechnologiesUrl = (slug: string) =>
  `/api/projects/${slug}/technologies`;

export const getProjectTechnologiesQueryKey = (slug: string) =>
  [getProjectTechnologiesUrl(slug)] as const;

export function useGetProjectTechnologies<
  TData = Technology[],
  TError = unknown,
>(
  slug: string,
  options?: {
    query?: UseQueryOptions<Technology[], TError, TData>;
  }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getProjectTechnologiesQueryKey(slug);
  const query = useQuery({
    queryKey,
    queryFn: () => customFetch<Technology[]>(getProjectTechnologiesUrl(slug)),
    enabled: !!slug,
    ...options?.query,
  }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useSetProjectTechnologies<TError = unknown, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Technology[],
      TError,
      { slug: string; technologyIds: number[] },
      TContext
    >;
  }
): UseMutationResult<
  Technology[],
  TError,
  { slug: string; technologyIds: number[] },
  TContext
> {
  return useMutation({
    mutationFn: ({ slug, technologyIds }) =>
      customFetch<Technology[]>(`/api/projects/${slug}/technologies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technologyIds }),
      }),
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export interface UploadResponse {
  url: string;
}

/**
 * Upload a file as raw binary to /api/upload/:folder.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  folder: string,
  file: File
): Promise<UploadResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch(`/api/upload/${folder}`, {
    method: "POST",
    body: arrayBuffer,
    headers: {
      "Content-Type": file.type,
      "X-Filename": file.name,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `HTTP ${response.status}`);
  }

  return response.json();
}
