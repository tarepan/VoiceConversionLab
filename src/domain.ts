// searched papers, which is used in several purpose
export type SearchedPaper = {
  id: string;
  title: string;
  summary: string;
};
export type ArXivSearchResults = SearchedPaper[];

// points: this is merely arXiv search result storage (status is for refined search)
export type ArXivRecord = {
  id: string;
  status: "candidate" | "confirmed" | "excluded";
};
export type ArXivStorage = ArXivRecord[];
