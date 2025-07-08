const baseUrl = 'http://localhost:3001';

import type { ReportPreview, DataSource } from './src/app/types/report';

/**
 * Helper: generic fetcher that returns JSON.
 */
async function fetcher<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Get a single report preview by id (default: 1)
 */
export function getReportPreview(id: number = 1) {
  return fetcher<ReportPreview>(`reportPreview/${id}`);
}

/**
 * List all report previews.
 */
export function listReportPreviews() {
  return fetcher<ReportPreview[]>(`reportPreview`);
}

// Generic helper for lists of DataSource
function getSources(resource: string) {
  return fetcher<DataSource[]>(resource);
}

function putSources(resource: string, sources: DataSource[]) {
  return fetcher<void>(resource, {
    method: 'PUT',
    body: JSON.stringify(sources)
  });
}

export const api = {
  getScope1Sources: () => getSources('scope1Sources'),
  getScope2Sources: () => getSources('scope2Sources'),
  getScope3Sources: () => getSources('scope3Sources'),
  getSummarySources: () => getSources('summarySources'),
  getAvailableSources: () => getSources('availableSources'),

  saveScope1Sources: (s: DataSource[]) => putSources('scope1Sources', s),
  saveScope2Sources: (s: DataSource[]) => putSources('scope2Sources', s),
  saveScope3Sources: (s: DataSource[]) => putSources('scope3Sources', s),
  saveSummarySources: (s: DataSource[]) => putSources('summarySources', s)
};
