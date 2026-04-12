import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import {
  fetchContributors,
  fetchLanguages,
  fetchRepoDetail,
} from "../../../services/github";
import type {
  Contributor,
  LanguageMap,
  RepoDetail,
} from "../../../types/github";

const COLORS = [
  "#0066cc",
  "#ff6b35",
  "#28a745",
  "#ffc107",
  "#9b59b6",
  "#e74c3c",
  "#1abc9c",
  "#f39c12",
];

const formatNumber = (n: number): string => n.toLocaleString();

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatSize = (kb: number): string => {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const buildPieData = (langMap: LanguageMap) => {
  const total = Object.values(langMap).reduce((a, b) => a + b, 0);
  return Object.entries(langMap).map(([lang, bytes], i) => ({
    value: Math.round((bytes / total) * 100),
    label: lang,
    color: COLORS[i % COLORS.length],
    text: `${Math.round((bytes / total) * 100)}%`,
  }));
};

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function RepoDetailScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();

  const [detail, setDetail] = useState<RepoDetail | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [languages, setLanguages] = useState<LanguageMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailData, contributorData, languageData] = await Promise.all([
          fetchRepoDetail(owner, repo),
          fetchContributors(owner, repo),
          fetchLanguages(owner, repo),
        ]);
        setDetail(detailData);
        setContributors(contributorData.slice(0, 10));
        setLanguages(languageData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [owner, repo]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading repository...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!detail) return null;

  const pieData = buildPieData(languages);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={{ uri: detail.owner.avatar_url }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.repoName}>{detail.name}</Text>
          <Text style={styles.ownerName}>{detail.owner.login}</Text>
        </View>
      </View>

      {detail.description ? (
        <Text style={styles.description}>{detail.description}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Stats</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Stars"
          value={`⭐ ${formatNumber(detail.stargazers_count)}`}
        />
        <StatCard
          label="Forks"
          value={`🍴 ${formatNumber(detail.forks_count)}`}
        />
        <StatCard
          label="Watchers"
          value={`👁 ${formatNumber(detail.watchers_count)}`}
        />
        <StatCard
          label="Issues"
          value={`🐛 ${formatNumber(detail.open_issues_count)}`}
        />
        <StatCard label="Size" value={`💾 ${formatSize(detail.size)}`} />
        <StatCard
          label="Last Push"
          value={`📅 ${formatDate(detail.pushed_at)}`}
        />
      </View>

      {/*  Language Chart  */}
      {pieData.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.chartBox}>
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={55}
              centerLabelComponent={() => (
                <Text style={styles.chartCenter}>Lang</Text>
              )}
            />

            <View style={styles.legend}>
              {pieData.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText}>
                    {item.label} ({item.text})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {contributors.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>
            Top Contributors ({contributors.length})
          </Text>
          {contributors.map((c) => (
            <View key={c.login} style={styles.contributorRow}>
              <Image
                source={{ uri: c.avatar_url }}
                style={styles.contributorAvatar}
              />
              <View style={styles.contributorInfo}>
                <Text style={styles.contributorName}>{c.login}</Text>
                <Text style={styles.contributorCommits}>
                  {formatNumber(c.contributions)} contributions
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    color: "#cc0000",
    fontSize: 15,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  repoName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  ownerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
    marginTop: 8,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    width: "47%",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },

  chartBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  chartCenter: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  legend: {
    marginTop: 16,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#444",
  },

  contributorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  contributorCommits: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
