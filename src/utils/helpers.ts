import { TOrganization } from "../utils/interfaces/common";

// Matching configuration
const MATCH_CONFIG = {
  weights: {
    categoryExact: 3,
    categoryPartial: 1,
    tagExact: 2,
    tagSynonym: 1.5,
    tagPartial: 1,
    tagCategoryMatch: 0.5,
  },
  minScore: 2,
  defaultTopN: 3,
};

// Explicitly define the type for TAG_SYNONYMS
type TagSynonyms = {
  [key: string]: {
    matches: string[];
    category: string;
  };
};

const TAG_SYNONYMS: TagSynonyms = {
  innovation: {
    matches: ["innovate", "technology", "digital", "tech"],
    category: "ICT",
  },
  garbage: {
    matches: ["trash", "waste", "rubbish"],
    category: "Sanitation",
  },
  sanitation: {
    matches: ["cleanliness", "hygiene", "cleaning"],
    category: "Sanitation",
  },
  road: {
    matches: ["street", "highway", "pavement"],
    category: "Infrastructure",
  },
};

function calculateMatchScore(
  organization: TOrganization,
  userCategory: string,
  descriptionTags: string[],
): { score: number; matches: string[] } {
  const matches: string[] = [];
  let score = 0;

  const orgCategory = organization.category.toLowerCase();
  const userCategoryLower = userCategory.toLowerCase();
  const orgTags = organization.tags.map((t) => t.toLowerCase());

  // 1. Category matching
  if (orgCategory === userCategoryLower) {
    score += MATCH_CONFIG.weights.categoryExact;
    matches.push(`Category: ${organization.category}`);
  } else if (
    orgCategory.includes(userCategoryLower) ||
    userCategoryLower.includes(orgCategory)
  ) {
    score += MATCH_CONFIG.weights.categoryPartial;
    matches.push(`Partial category: ${organization.category}`);
  }

  // 2. Tag matching
  for (const tag of descriptionTags) {
    const tagLower = tag.toLowerCase();

    // Exact tag match
    if (orgTags.includes(tagLower)) {
      score += MATCH_CONFIG.weights.tagExact;
      matches.push(`Exact tag: ${tag}`);
      continue;
    }

    // Synonym match
    for (const [key, { matches: synonyms }] of Object.entries(TAG_SYNONYMS)) {
      if (
        (tagLower === key || synonyms.includes(tagLower)) &&
        orgTags.includes(key)
      ) {
        score += MATCH_CONFIG.weights.tagSynonym;
        matches.push(`Synonym: ${tag} → ${key}`);
        break;
      }
    }

    // Partial match
    if (
      orgTags.some(
        (orgTag) => orgTag.includes(tagLower) || tagLower.includes(orgTag),
      )
    ) {
      score += MATCH_CONFIG.weights.tagPartial;
      matches.push(`Partial: ${tag}`);
    }
  }

  // Bonus for category tags
  if (orgTags.includes(userCategoryLower)) {
    score += MATCH_CONFIG.weights.tagCategoryMatch;
    matches.push(`Category tag: ${userCategory}`);
  }

  return { score, matches };
}

export function determineBestOrganizations(
  organizations: TOrganization[],
  userCategory: string,
  descriptionTags: string[],
  topN: number = 3,
) {
  const MIN_SCORE = 2;

  return organizations
    .map((org) => ({
      organization: org,
      ...calculateMatchScore(org, userCategory, descriptionTags),
    }))
    .filter((match) => match.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

export function extractTags(description: string): string[] {
  const stopwords = new Set([
    // Articles
    "a",
    "an",
    "the",

    // Common conjunctions
    "and",
    "or",
    "but",
    "nor",
    "so",
    "for",
    "yet",
    "as",

    // Prepositions
    "at",
    "by",
    "from",
    "in",
    "into",
    "of",
    "on",
    "to",
    "with",

    // Pronouns
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",

    // Common verbs
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "can",
    "could",
    "may",
    "might",
    "must",

    // Other common words
    "this",
    "that",
    "these",
    "those",
    "there",
    "here",
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "where",
    "when",
    "how",
    "why",
    "not",
    "no",
    "yes",
    "if",
    "then",
    "else",
    "about",
    "above",
    "after",
    "before",
    "between",
    "during",
    "under",
    "over",
    "again",
    "further",
    "once",
    "more",
    "most",
    "other",
    "some",
    "such",
    "only",
    "own",
    "same",
    "than",
    "too",
    "very",
    "just",
    "now",
    "also",
    "any",
    "each",
    "both",
    "all",
    "few",
    "many",
    "several",
    "some",
    "such",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
  ]);

  const words = description
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\w\s]|_/g, " ")
    .split(/\s+/)
    .map((word) => word.toLowerCase().trim())
    .filter(
      (word) =>
        word.length > 2 && // Minimum length
        !stopwords.has(word) &&
        !/\d/.test(word),
    );

  const stemmedWords = words.map((word) => {
    if (word.endsWith("ing")) return word.replace(/ing$/, "");
    if (word.endsWith("tion")) return word.replace(/tion$/, "t");
    if (word.endsWith("ies")) return word.replace(/ies$/, "y");
    if (word.endsWith("s")) return word.replace(/s$/, "");
    return word;
  });

  // Get unique words
  return [...new Set(stemmedWords)];
}
