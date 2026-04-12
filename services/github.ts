import Constants from "expo-constants";
import type {
  Contributor,
  LanguageMap,
  RepoDetail,
  SearchResponse,
  SortOption,
} from "../types/github";

const BASE_URL = "https://api.github.com";

const TOKEN = Constants.expoConfig?.extra?.githubToken ?? ""; // token -> app.json

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (TOKEN) {
    headers["Authorization"] = `Bearer ${TOKEN}`;
  }
  return headers;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 403) {
    throw new Error("GitHub API rate limit reached (403). Add a token");
  }
  if (res.status === 429) {
    throw new Error("Too many requests (429). Please wait and try again.");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const searchRepositories = async (
  query: string,
  language: string,
  sort: SortOption,
  page: number,
): Promise<SearchResponse> => {
  const lang = language ? `+language:${language}` : "";
  const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}${lang}&sort=${sort}&order=desc&per_page=30&page=${page}`;

  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse<SearchResponse>(res);
};

export const fetchRepoDetail = async (
  owner: string,
  repo: string,
): Promise<RepoDetail> => {
  const url = `${BASE_URL}/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse<RepoDetail>(res);
};

export const fetchContributors = async (
  owner: string,
  repo: string,
): Promise<Contributor[]> => {
  const url = `${BASE_URL}/repos/${owner}/${repo}/contributors`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse<Contributor[]>(res);
};

export const fetchLanguages = async (
  owner: string,
  repo: string,
): Promise<LanguageMap> => {
  const url = `${BASE_URL}/repos/${owner}/${repo}/languages`;
  const res = await fetch(url, { headers: getHeaders() });
  return handleResponse<LanguageMap>(res);
};
