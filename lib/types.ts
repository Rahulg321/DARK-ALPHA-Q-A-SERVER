export type Learning = {
  learning: string;
  followUpQuestions: string[];
};

export type Research = {
  query: string | undefined;
  queries: string[];
  searchResults: SearchResult[];
  learnings: Learning[];
  completedQueries: string[];
};
export type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export const accumulatedResearch: Research = {
  query: undefined,
  queries: [],
  searchResults: [],
  learnings: [],
  completedQueries: [],
};
