
export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: number;
}

export interface SearchResult {
  answer: string;
  relevantDocs: Document[];
  query: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ERROR = 'ERROR'
}
