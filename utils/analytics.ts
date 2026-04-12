import type { Repository } from '../types/github';


export interface LanguageStat {
  language: string;
  count: number;
}

export interface StarsByDate {
  date: string;
  stars: number;
}

interface ForksVsStars {
  name: string;
  stars: number;
  forks: number;
}

interface AnalyticsResult {
  languageStats: LanguageStat[];
  starsByDate: StarsByDate[];
  forksVsStars: ForksVsStars[];
}


const computeLanguageStats = (
  repos: Repository[]
): LanguageStat[] => {
  const map: Record<string, number> = {};

  for (const repo of repos) {
    const lang = repo.language ?? 'Unknown';
    map[lang] = (map[lang] ?? 0) + 1;
  }

  return Object.entries(map)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);
};


const computeStarsByDate = (
  repos: Repository[]
): StarsByDate[] => {
  const map: Record<string, number> = {};

  for (const repo of repos) {
    // Group by month (YYYY-MM)
    const date = repo.updated_at.slice(0, 7);
    map[date] = (map[date] ?? 0) + repo.stargazers_count;
  }

  return Object.entries(map)
    .map(([date, stars]) => ({ date, stars }))
    .sort((a, b) => a.date.localeCompare(b.date));
};


const computeForksVsStars = (
  repos: Repository[]
): ForksVsStars[] => {
  return repos
    .slice(0, 10) // Top 10 
    .map((repo) => ({
      name: repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
};


export const filterByDateRange = (
  repos: Repository[],
  dateFrom: string | null,
  dateTo: string | null
): Repository[] => {
  return repos.filter((repo) => {
    const updated = new Date(repo.updated_at).getTime();

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      if (updated < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      if (updated > to) return false;
    }
    return true;
  });
};


export const computeAnalytics = (
  repos: Repository[]
): AnalyticsResult => {
  return {
    languageStats: computeLanguageStats(repos),
    starsByDate: computeStarsByDate(repos),
    forksVsStars: computeForksVsStars(repos),
  };
};


export const reposToCSV = (repos: Repository[]): string => {
  const headers = [
    'Name',
    'Owner',
    'Stars',
    'Forks',
    'Language',
    'Updated At',
    'URL',
  ].join(',');

  const rows = repos.map((repo) =>
    [
      `"${repo.name}"`,
      `"${repo.owner.login}"`,
      repo.stargazers_count,
      repo.forks_count,
      `"${repo.language ?? 'Unknown'}"`,
      `"${repo.updated_at}"`,
      `"${repo.html_url}"`,
    ].join(',')
  );

  return [headers, ...rows].join('\n');
};