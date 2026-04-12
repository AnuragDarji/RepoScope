import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCache } from "../../hooks/useCache";
import { useDebounce } from "../../hooks/useDebounce";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import type { Repository } from "../../types/github";
import { filterByDateRange } from "../../utils/analytics";

const SORT_OPTIONS = ["stars", "forks", "updated"] as const;
const LANGUAGE_OPTIONS = [
  "",
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
];

export default function SearchScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 500);

  const {
    search,
    results,
    totalCount,
    isLoading,
    error,
    filters,
    setLanguage,
    setSort,
    setPage,
    setDateFrom,
    setDateTo,
  } = useSearch();

  const { hasMore, loadNextPage } = usePagination();
  const { searchHistory, clearHistory } = useCache();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPage(1);
    search(debouncedQuery, filters.language, filters.sort, 1, false);
  }, [debouncedQuery, filters.language, filters.sort]);

  useEffect(() => {
    if (filters.page === 1) return;
    search(debouncedQuery, filters.language, filters.sort, filters.page, true);
  }, [filters.page]);

  const filteredResults = filterByDateRange(
    results,
    filters.dateFrom,
    filters.dateTo,
  );

  const handleRepoPress = (repo: Repository) => {
    router.push(`/repo/${repo.owner.login}/${repo.name}`);
  };

  const handleHistoryPress = (query: string) => {
    setInputValue(query);
    search(query, filters.language, filters.sort, 1, false);
  };

  const handleRefresh = () => {
    search(debouncedQuery, filters.language, filters.sort, 1, false);
  };

  const renderRepo = ({ item }: { item: Repository }) => (
    <TouchableOpacity
      style={styles.repoCard}
      onPress={() => handleRepoPress(item)}
    >
      <Text style={styles.repoName}>{item.name}</Text>
      <Text style={styles.repoOwner}>by {item.owner.login}</Text>
      {item.description ? (
        <Text style={styles.repoDesc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.repoMeta}>
        <Text style={styles.metaItem}>
          ⭐ {item.stargazers_count.toLocaleString()}
        </Text>
        <Text style={styles.metaItem}>
          🍴 {item.forks_count.toLocaleString()}
        </Text>
        <Text style={styles.metaItem}>{item.language ?? "Unknown"}</Text>
        <Text style={styles.metaItem}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View>
      {searchHistory.length > 0 && inputValue.length === 0 && (
        <View style={styles.historyBox}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.dangerText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((q, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleHistoryPress(q)}
              style={styles.historyItem}
            >
              <Text style={styles.historyItemText}>🕐 {q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.filterLabel}>Sort by</Text>
      <View style={styles.row}>
        {SORT_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, filters.sort === s && styles.chipActive]}
            onPress={() => setSort(s)}
          >
            <Text
              style={[
                styles.chipText,
                filters.sort === s && styles.chipTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterLabel}>Language</Text>
      <View style={styles.row}>
        {LANGUAGE_OPTIONS.map((lang) => (
          <TouchableOpacity
            key={lang || "all"}
            style={[
              styles.chip,
              filters.language === lang && styles.chipActive,
            ]}
            onPress={() => setLanguage(lang)}
          >
            <Text
              style={[
                styles.chipText,
                filters.language === lang && styles.chipTextActive,
              ]}
            >
              {lang || "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.filterLabel}>Date Range</Text>
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

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {filteredResults.length > 0 && (
        <Text style={styles.resultCount}>
          {filteredResults.length} of {totalCount.toLocaleString()} repositories
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator style={{ marginVertical: 16 }} color="#0066cc" />;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>
          {inputValue.length === 0
            ? "Search GitHub repositories"
            : "No results found"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}  
          placeholder="Search repositories..."
          value={inputValue}
          onChangeText={setInputValue}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing" 
        />
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRepo}
        ListHeaderComponent={renderFilters}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={hasMore ? loadNextPage : undefined}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && filters.page === 1}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBar: { padding: 16, paddingBottom: 0, backgroundColor: "#f5f5f5" },
  listContent: { padding: 16, paddingBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  dateInput: { flex: 1 },
  dateRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  chipActive: { backgroundColor: "#0066cc", borderColor: "#0066cc" },
  chipText: { fontSize: 13, color: "#444" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  repoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  repoName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066cc",
    marginBottom: 2,
  },
  repoOwner: { fontSize: 13, color: "#666", marginBottom: 6 },
  repoDesc: { fontSize: 13, color: "#444", marginBottom: 8, lineHeight: 18 },
  repoMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { fontSize: 12, color: "#555" },
  historyBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyTitle: { fontWeight: "700", fontSize: 13, color: "#333" },
  historyItem: { paddingVertical: 7 },
  historyItemText: { fontSize: 14, color: "#555" },
  dangerText: { fontSize: 13, color: "#cc0000" },
  errorBox: {
    backgroundColor: "#fff0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  errorText: { color: "#cc0000", fontSize: 13 },
  resultCount: { fontSize: 13, color: "#888", marginBottom: 10 },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 15, color: "#aaa" },
});
