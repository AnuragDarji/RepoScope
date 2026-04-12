export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  owner: Owner;
}

export interface Owner {
  login: string;
  avatar_url: string;
}

export interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface RepoDetail extends Repository {
  subscribers_count: number;
}

export type SortOption = 'stars' | 'forks' | 'updated';

export interface SearchFilters {
  query: string;
  language: string;
  sort: SortOption;
  page: number;
  dateFrom: string | null;
  dateTo: string | null;
}

export type LanguageMap = Record<string, number>;