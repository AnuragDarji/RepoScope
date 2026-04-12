import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Repository } from "../types/github";
import type { LanguageStat, StarsByDate } from "./analytics";
import { reposToCSV } from "./analytics";

export const exportToCSV = async (repos: Repository[]): Promise<void> => {
  if (repos.length === 0) {
    throw new Error("No data to export");
  }

  const csv = reposToCSV(repos);
  const fileName = `reposcope_${Date.now()}.csv`;

  const file = new File(Paths.document, fileName);

  await file.write(csv);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Export CSV",
    UTI: "public.comma-separated-values-text",
  });
};

const buildPDFHTML = (
  repos: Repository[],
  languageStats: LanguageStat[],
  starsByDate: StarsByDate[],
): string => {
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const totalForks = repos.reduce((a, r) => a + r.forks_count, 0);
  const generatedAt = new Date().toLocaleString();

  const repoRows = repos
    .map(
      (r) => `
      <tr>
        <td>${r.name}</td>
        <td>${r.owner.login}</td>
        <td>${r.stargazers_count.toLocaleString()}</td>
        <td>${r.forks_count.toLocaleString()}</td>
        <td>${r.language ?? "Unknown"}</td>
        <td>${new Date(r.updated_at).toLocaleDateString()}</td>
      </tr>`,
    )
    .join("");

  const langRows = languageStats
    .map(
      (l) => `
      <tr>
        <td>${l.language}</td>
        <td>${l.count}</td>
      </tr>`,
    )
    .join("");

  const starsRows = starsByDate
    .map(
      (s) => `
      <tr>
        <td>${s.date}</td>
        <td>${s.stars.toLocaleString()}</td>
      </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, sans-serif;
            font-size: 12px;
            color: #222;
            padding: 32px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
            padding-bottom: 16px;
            border-bottom: 2px solid #0066cc;
          }

          .header h1 {
            font-size: 24px;
            color: #0066cc;
            font-weight: 800;
          }

          .header p {
            font-size: 11px;
            color: #888;
            margin-top: 4px;
          }

          .summary {
            display: flex;
            gap: 12px;
            margin-bottom: 28px;
          }

          .summary-card {
            flex: 1;
            background: #f0f6ff;
            border-radius: 8px;
            padding: 14px;
            text-align: center;
            border: 1px solid #d0e4ff;
          }

          .summary-card .value {
            font-size: 20px;
            font-weight: 800;
            color: #0066cc;
          }

          .summary-card .label {
            font-size: 11px;
            color: #666;
            margin-top: 4px;
          }

          .section {
            margin-bottom: 28px;
          }

          .section h2 {
            font-size: 14px;
            font-weight: 700;
            color: #111;
            margin-bottom: 10px;
            padding-left: 8px;
            border-left: 3px solid #0066cc;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          thead tr {
            background: #0066cc;
            color: white;
          }

          thead th {
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
          }

          tbody tr:nth-child(even) {
            background: #f8f8f8;
          }

          tbody td {
            padding: 7px 10px;
            border-bottom: 1px solid #eee;
          }

          .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 10px;
            color: #aaa;
          }
        </style>
      </head>

      <body>

        <div class="header">
          <div>
            <h1>RepoScope Report</h1>
            <p>GitHub Repository Analytics Export</p>
          </div>
          <div style="text-align: right;">
            <p>Generated: ${generatedAt}</p>
            <p>Total repos: ${repos.length}</p>
          </div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="value">${repos.length}</div>
            <div class="label">Repositories</div>
          </div>
          <div class="summary-card">
            <div class="value">${totalStars.toLocaleString()}</div>
            <div class="label">Total Stars</div>
          </div>
          <div class="summary-card">
            <div class="value">${totalForks.toLocaleString()}</div>
            <div class="label">Total Forks</div>
          </div>
          <div class="summary-card">
            <div class="value">${languageStats.length}</div>
            <div class="label">Languages</div>
          </div>
        </div>

        <div class="section">
          <h2>Repositories</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Stars</th>
                <th>Forks</th>
                <th>Language</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>${repoRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>Language Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Language</th>
                <th>Repo Count</th>
              </tr>
            </thead>
            <tbody>${langRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>Stars by Month</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Stars</th>
              </tr>
            </thead>
            <tbody>${starsRows}</tbody>
          </table>
        </div>

        <div class="footer">
          RepoScope — Generated on ${generatedAt}
        </div>

      </body>
    </html>
  `;
};

export const exportToPDF = async (
  repos: Repository[],
  languageStats: LanguageStat[],
  starsByDate: StarsByDate[],
): Promise<void> => {
  if (repos.length === 0) {
    throw new Error("No data to export");
  }

  const html = buildPDFHTML(repos, languageStats, starsByDate);

  const { uri } = await Print.printToFileAsync({ html });

  const fileName = `reposcope_${Date.now()}.pdf`;

  const newFile = new File(Paths.document, fileName);
  const tempFile = new File(uri);

  await tempFile.move(newFile);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(newFile.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Export PDF",
    UTI: "com.adobe.pdf",
  });
};
