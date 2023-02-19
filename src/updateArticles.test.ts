import { updateArticleStatus } from "./updateArticles";
import type { ArXivStorage } from "./domain";

test("updateArticles", () => {
  const input: ArXivStorage = [
    {
      id: { repository: "arXiv", article: "1", version: "1" },
      status: "candidate",
    },
    {
      id: { repository: "arXiv", article: "2", version: "2" },
      status: "candidate",
    },
  ];
  // replace based on index

  const expected: ArXivStorage = [
    {
      id: { repository: "arXiv", article: "1", version: "1" },
      status: "candidate",
    },
    {
      id: { repository: "arXiv", article: "2", version: "2" },
      status: "confirmed",
    },
  ];
  expect(updateArticleStatus(input, "2", "confirmed")).toStrictEqual(expected);
});
