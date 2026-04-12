import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useSearchStore } from "../../store/searchStore";
import { useUIStore } from "../../store/uiStore";
import { exportToCSV, exportToPDF } from "../../utils/export";

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

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.emptyBox}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

export default function AnalyticsScreen() {
  const { languageStats, starsByDate, forksVsStars, filteredResults } =
    useAnalytics();

  const { filters, setDateFrom, setDateTo } = useSearchStore();
  const { isExporting, exportError, setExporting, setExportError } =
    useUIStore();

  const hasData = filteredResults.length > 0;

  const barData = languageStats.slice(0, 8).map((item, i) => ({
    value: item.count,
    label: item.language.slice(0, 6),
    frontColor: COLORS[i % COLORS.length],
    topLabelComponent: () => <Text style={styles.barLabel}>{item.count}</Text>,
  }));

  const lineData = starsByDate.slice(0, 12).map((item) => ({
    value: item.stars,
    label: item.date.slice(5), // MM only
    dataPointText: item.stars.toLocaleString(),
  }));

  const pieData = forksVsStars.slice(0, 5).flatMap((item, i) => [
    {
      value: item.stars,
      color: COLORS[i % COLORS.length],
      label: `${item.name.slice(0, 8)} ⭐`,
    },
    {
      value: item.forks,
      color: COLORS[(i + 4) % COLORS.length],
      label: `${item.name.slice(0, 8)} 🍴`,
    },
  ]);

  const handleCSVExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportToCSV(filteredResults);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handlePDFExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportToPDF(filteredResults, languageStats, starsByDate);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Analytics</Text>
      <Text style={styles.pageSubtitle}>
        {hasData
          ? `Based on ${filteredResults.length} repositories`
          : "Search repositories to see analytics"}
      </Text>

      <View style={styles.card}>
        <SectionHeader title="📅 Date Filter" />
        <Text style={styles.filterNote}>Affects charts, list, and exports</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="From (YYYY-MM-DD)"
            value={filters.dateFrom ?? ""}
            onChangeText={(t) => setDateFrom(t || null)}
          />
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="To (YYYY-MM-DD)"
            value={filters.dateTo ?? ""}
            onChangeText={(t) => setDateTo(t || null)}
          />
        </View>
        {(filters.dateFrom || filters.dateTo) && (
          <TouchableOpacity
            onPress={() => {
              setDateFrom(null);
              setDateTo(null);
            }}
          >
            <Text style={styles.clearText}>✕ Clear date filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasData && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredResults.length}</Text>
            <Text style={styles.summaryLabel}>Repos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {filteredResults
                .reduce((a, r) => a + r.stargazers_count, 0)
                .toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Total Stars</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {filteredResults
                .reduce((a, r) => a + r.forks_count, 0)
                .toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Total Forks</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{languageStats.length}</Text>
            <Text style={styles.summaryLabel}>Languages</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <SectionHeader title="📊 Repos by Language" />
        {barData.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={barData}
              width={Math.max(300, barData.length * 60)}
              height={200}
              barWidth={36}
              spacing={16}
              roundedTop
              hideRules
              xAxisThickness={1}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
              maxValue={Math.max(...barData.map((d) => d.value)) + 2}
            />
          </ScrollView>
        ) : (
          <EmptyState message="No language data yet" />
        )}
      </View>

      <View style={styles.card}>
        <SectionHeader title="📈 Stars Over Time" />
        {lineData.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={lineData}
              width={Math.max(300, lineData.length * 60)}
              height={200}
              color="#0066cc"
              thickness={2}
              dataPointsColor="#0066cc"
              dataPointsRadius={4}
              hideRules={false}
              rulesColor="#f0f0f0"
              xAxisThickness={1}
              yAxisThickness={0}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
              areaChart
              startFillColor="#0066cc"
              endFillColor="#ffffff"
              startOpacity={0.2}
              endOpacity={0.0}
            />
          </ScrollView>
        ) : (
          <EmptyState message="Not enough date data to plot" />
        )}
      </View>

      <View style={styles.card}>
        <SectionHeader title="🥧 Forks vs Stars (Top 5)" />
        {pieData.length > 0 ? (
          <View style={styles.pieBox}>
            <PieChart
              data={pieData}
              donut
              radius={100}
              innerRadius={60}
              centerLabelComponent={() => (
                <Text style={styles.pieCenter}>Top{"\n"}Repos</Text>
              )}
            />
            {/* Legend */}
            <View style={styles.legend}>
              {pieData.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <EmptyState message="No comparison data yet" />
        )}
      </View>

      {languageStats.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="🌐 Language Breakdown" />
          {languageStats.map((item, i) => (
            <View key={item.language} style={styles.tableRow}>
              <View style={styles.tableLeft}>
                <View
                  style={[
                    styles.tableColorDot,
                    { backgroundColor: COLORS[i % COLORS.length] },
                  ]}
                />
                <Text style={styles.tableLang}>{item.language}</Text>
              </View>
              <Text style={styles.tableCount}>{item.count} repos</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <SectionHeader title="📤 Export" />
        <Text style={styles.exportNote}>
          Exports {filteredResults.length} repositories with active filters
        </Text>

        {exportError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{exportError}</Text>
          </View>
        )}

        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[
              styles.exportBtn,
              (!hasData || isExporting) && styles.exportBtnDisabled,
            ]}
            onPress={handleCSVExport}
            disabled={!hasData || isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.exportBtnText}>Export CSV</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.exportBtn,
              styles.exportBtnPDF,
              (!hasData || isExporting) && styles.exportBtnDisabled,
            ]}
            onPress={handlePDFExport}
            disabled={!hasData || isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.exportBtnText}>Export PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 50,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  filterNote: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    backgroundColor: "#fafafa",
  },
  dateInput: {
    flex: 1,
  },
  clearText: {
    fontSize: 13,
    color: "#cc0000",
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0066cc",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  axisText: {
    fontSize: 10,
    color: "#aaa",
  },
  barLabel: {
    fontSize: 10,
    color: "#555",
    marginBottom: 2,
  },
  pieBox: {
    alignItems: "center",
  },
  pieCenter: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
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
    gap: 5,
    width: "45%",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#444",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tableLang: {
    fontSize: 13,
    color: "#333",
  },
  tableCount: {
    fontSize: 13,
    color: "#888",
  },

  exportNote: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  exportRow: {
    flexDirection: "row",
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: "#0066cc",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
  },
  exportBtnPDF: {
    backgroundColor: "#cc3300",
  },
  exportBtnDisabled: {
    opacity: 0.4,
  },
  exportBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#fff0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  errorText: {
    color: "#cc0000",
    fontSize: 13,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    color: "#bbb",
    fontSize: 13,
  },
});
