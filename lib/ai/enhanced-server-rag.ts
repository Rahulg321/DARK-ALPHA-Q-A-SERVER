import { generateEmbeddingsFromChunks } from "./embedding";
import { accumulatedResearch } from "../types";

export interface ServerRAGResult {
  searchResults: any[];
  contextSummary: {
    totalSources: number;
    sourcesBreakdown: Record<string, number>;
    averageScore: number;
  };
  rawContext: string;
  researchQueries?: string[];
  webResults?: any[];
}

/**
 * Enhanced RAG search for the server that combines:
 * 1. Internal research accumulation
 * 2. Web search results from tools
 * 3. Vector similarity matching
 */
export async function enhancedServerRAGSearch(
  query: string,
  options: {
    includeAccumulatedResearch?: boolean;
    includeWebSearch?: boolean;
    maxResults?: number;
  } = {}
): Promise<ServerRAGResult> {
  const {
    includeAccumulatedResearch = true,
    includeWebSearch = false, // Web search would be handled by existing tools
    maxResults = 15,
  } = options;

  console.log("Enhanced server RAG search for query:", query);
  
  const allResults: any[] = [];
  const sourcesBreakdown: Record<string, number> = {};

  // 1. Include accumulated research from previous queries
  if (includeAccumulatedResearch && accumulatedResearch.learnings.length > 0) {
    console.log("Including accumulated research learnings:", accumulatedResearch.learnings.length);
    
    for (const learning of accumulatedResearch.learnings) {
      allResults.push({
        type: 'research_learning',
        content: learning.learning,
        followUpQuestions: learning.followUpQuestions,
        score: 0.8, // High relevance since it's from previous research
        source: 'accumulated_research'
      });
      sourcesBreakdown['research_learning'] = (sourcesBreakdown['research_learning'] || 0) + 1;
    }
  }

  // 2. Include search results from previous queries
  if (includeAccumulatedResearch && accumulatedResearch.searchResults.length > 0) {
    console.log("Including accumulated search results:", accumulatedResearch.searchResults.length);
    
    for (const searchResult of accumulatedResearch.searchResults) {
      allResults.push({
        type: 'search_result',
        title: searchResult.title,
        url: searchResult.url,
        content: searchResult.content,
        score: 0.7,
        source: 'web_search'
      });
      sourcesBreakdown['search_result'] = (sourcesBreakdown['search_result'] || 0) + 1;
    }
  }

  // 3. Semantic similarity matching within accumulated content
  if (allResults.length > 0) {
    try {
      // Create chunks from all accumulated content for similarity matching
      const contentChunks = allResults.map(result => result.content).filter(Boolean);
      
      if (contentChunks.length > 0) {
        console.log("Performing semantic similarity matching on", contentChunks.length, "content chunks");
        
        // This would require implementing vector similarity search
        // For now, we'll use keyword matching as a fallback
        const queryLower = query.toLowerCase();
        const keywords = queryLower.split(/\s+/).filter(word => word.length > 3);
        
        // Score results based on keyword matching
        allResults.forEach(result => {
          if (result.content) {
            const contentLower = result.content.toLowerCase();
            let keywordScore = 0;
            
            keywords.forEach(keyword => {
              if (contentLower.includes(keyword)) {
                keywordScore += 1;
              }
            });
            
            // Combine with existing score
            result.score = (result.score || 0.5) + (keywordScore / keywords.length) * 0.3;
          }
        });
      }
    } catch (error) {
      console.error("Error in semantic similarity matching:", error);
    }
  }

  // Sort by score and limit results
  allResults.sort((a, b) => (b.score || 0) - (a.score || 0));
  const limitedResults = allResults.slice(0, maxResults);

  // Calculate context summary
  const averageScore = limitedResults.length > 0 
    ? limitedResults.reduce((sum, result) => sum + (result.score || 0), 0) / limitedResults.length
    : 0;

  const contextSummary = {
    totalSources: limitedResults.length,
    sourcesBreakdown,
    averageScore,
  };

  // Create raw context string
  const rawContext = limitedResults
    .map((result, index) => {
      const prefix = `[${index + 1}] ${result.type.toUpperCase()}: ${result.title || 'Research Finding'}`;
      const score = result.score ? ` (score: ${result.score.toFixed(3)})` : '';
      const url = result.url ? `\nURL: ${result.url}` : '';
      return `${prefix}${score}${url}\n${result.content}\n---`;
    })
    .join('\n\n');

  console.log("Enhanced server RAG search completed:", {
    totalResults: limitedResults.length,
    sourcesBreakdown,
    averageScore: averageScore.toFixed(3),
  });

  return {
    searchResults: limitedResults,
    contextSummary,
    rawContext,
    researchQueries: accumulatedResearch.queries,
    webResults: accumulatedResearch.searchResults,
  };
}

/**
 * Helper function to add context to research accumulation
 */
export function addToResearchContext(
  learnings: any[] = [],
  searchResults: any[] = [],
  queries: string[] = []
) {
  // Add new learnings
  learnings.forEach(learning => {
    if (!accumulatedResearch.learnings.some(existing => existing.learning === learning.learning)) {
      accumulatedResearch.learnings.push(learning);
    }
  });

  // Add new search results
  searchResults.forEach(result => {
    if (!accumulatedResearch.searchResults.some(existing => existing.url === result.url)) {
      accumulatedResearch.searchResults.push(result);
    }
  });

  // Add new queries
  queries.forEach(query => {
    if (!accumulatedResearch.queries.includes(query)) {
      accumulatedResearch.queries.push(query);
    }
  });

  console.log("Updated research context:", {
    learnings: accumulatedResearch.learnings.length,
    searchResults: accumulatedResearch.searchResults.length,
    queries: accumulatedResearch.queries.length,
  });
}

/**
 * Clear accumulated research context
 */
export function clearResearchContext() {
  accumulatedResearch.learnings = [];
  accumulatedResearch.searchResults = [];
  accumulatedResearch.queries = [];
  accumulatedResearch.completedQueries = [];
  console.log("Cleared research context");
}

/**
 * Get summary of current research context
 */
export function getResearchContextSummary() {
  return {
    totalLearnings: accumulatedResearch.learnings.length,
    totalSearchResults: accumulatedResearch.searchResults.length,
    totalQueries: accumulatedResearch.queries.length,
    completedQueries: accumulatedResearch.completedQueries.length,
    hasContext: accumulatedResearch.learnings.length > 0 || accumulatedResearch.searchResults.length > 0,
  };
}