import { updateArticleStatus } from "./updateArticles";
import { ArXivStorage } from "./domain";

test("updateArticles", () => {
  const input: ArXivStorage = [
    {
      id: "1",
      status: "candidate"
    },
    {
      id: "2",
      status: "candidate"
    }
  ];
  // replace based on index

  const expected: ArXivStorage = [
    {
      id: "1",
      status: "candidate"
    },
    {
      id: "2",
      status: "confirmed"
    }
  ];
  expect(updateArticleStatus(input, "2", "confirmed")).toStrictEqual(expected);
});
