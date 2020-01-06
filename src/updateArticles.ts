import { ArXivStorage, resolved } from "./domain";
import { produce } from "immer";

export function updateArticleStatus(
  storage: ArXivStorage,
  id: string,
  status: resolved
): ArXivStorage {
  return produce(storage, draft => {
    // find index
    const index = draft.findIndex(paper => paper.id === id);
    draft[index].status = status;
  });
}
