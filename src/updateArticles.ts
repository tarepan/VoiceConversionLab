import { ArXivStorage, resolved, Identity } from "./domain";
import { produce } from "immer";

export function arXivID2identity(arXivID: string): Identity {
  const result = /http:\/\/arxiv.org\/abs\/(\d+\.\d+)v(\d+)/.exec(arXivID);
  if (result && result.length >= 3) {
    return {
      repository: "arXiv",
      article: result[1],
      version: result[2],
    };
  } else {
    throw new Error("arXivID parse error");
  }
}

export function updateArticleStatus(
  storage: ArXivStorage,
  articleID: string,
  status: resolved
): ArXivStorage {
  return produce(storage, (draft) => {
    // find index
    const index = draft.findIndex((paper) => paper.id.article === articleID);
    draft[index].status = status;
  });
}
