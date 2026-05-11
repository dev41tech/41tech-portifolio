import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { Technology, TeamMember } from "./generated/api.schemas";

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

export interface SetProjectTechnologiesResponse {
  success: boolean;
  technologyIds: number[];
}

export function useSetProjectTechnologies<TError = unknown, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      SetProjectTechnologiesResponse,
      TError,
      { slug: string; technologyIds: number[] },
      TContext
    >;
  }
): UseMutationResult<
  SetProjectTechnologiesResponse,
  TError,
  { slug: string; technologyIds: number[] },
  TContext
> {
  return useMutation({
    mutationFn: ({ slug, technologyIds }) =>
      customFetch<SetProjectTechnologiesResponse>(`/api/projects/${slug}/technologies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technologyIds }),
      }),
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Project Owners
// ---------------------------------------------------------------------------

export type ProjectOwner = Pick<TeamMember, "id" | "name" | "roleTitle" | "avatarUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">;

export const getProjectOwnersUrl = (slug: string) =>
  `/api/projects/${slug}/owners`;

export const getProjectOwnersQueryKey = (slug: string) =>
  [getProjectOwnersUrl(slug)] as const;

export function useGetProjectOwners<TData = ProjectOwner[], TError = unknown>(
  slug: string,
  options?: { query?: UseQueryOptions<ProjectOwner[], TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getProjectOwnersQueryKey(slug);
  const query = useQuery({
    queryKey,
    queryFn: () => customFetch<ProjectOwner[]>(getProjectOwnersUrl(slug)),
    enabled: !!slug,
    ...options?.query,
  }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export interface SetProjectOwnersResponse {
  success: boolean;
  teamMemberIds: number[];
}

export function useSetProjectOwners<TError = unknown, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      SetProjectOwnersResponse,
      TError,
      { slug: string; teamMemberIds: number[] },
      TContext
    >;
  }
): UseMutationResult<
  SetProjectOwnersResponse,
  TError,
  { slug: string; teamMemberIds: number[] },
  TContext
> {
  return useMutation({
    mutationFn: ({ slug, teamMemberIds }) =>
      customFetch<SetProjectOwnersResponse>(`/api/projects/${slug}/owners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamMemberIds }),
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
