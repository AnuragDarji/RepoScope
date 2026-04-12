# RepoScope

A React Native app to search GitHub repositories, view details,
analyze data with charts, and export filtered results.

---

## Getting Started

### 1. Clone the repo

git clone https://github.com/AnuragDarji/RepoScope.git
cd RepoScope

### 2. Install dependencies

npm install

### 3. Add GitHub Token (optional but recommended)

The GitHub API allows 60 requests/hour without a token.

To increase this limit to 5000 requests/hour:

Step 1 — Go to https://github.com/settings/tokens

Step 2 — Click "Generate new token"

Step 3 — Copy the token

Step 4 — Open app.json and paste it:

```json
"extra": {
  "githubToken": "YOUR_TOKEN_HERE"
}
```


### 4. Start the app

npx expo start

---

## Assumptions

1. Date filter uses repo's updated_at field
2. Analytics are computed from the currently fetched
   result set, not all GitHub data
3. Contributors list is capped at 10 per repo
4. Forks vs Stars chart shows top 10 repos only
5. Language filter uses GitHub's predefined languages
6. Cache TTL is set to 5 minutes
7. PDF export uses HTML-to-PDF via expo-print
8. No authentication screen — token is set via app.json

---
