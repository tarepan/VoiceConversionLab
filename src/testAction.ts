import * as core from "@actions/core";
import * as github from "@actions/github";
import { searchArXiv } from "./arXivSearch";
import { ArXivStorage } from "./domain";

console.log("hello, this is test act.");

async function run(): Promise<void> {
  // fetch search result
  const searchResults = await searchArXiv();

  // fetch storage
  const octokit = new github.GitHub(core.getInput("token"));
  const contents = await octokit.repos.getContents({
    ...github.context.repo,
    path: "arXivSearches.json"
  });
  const storage: ArXivStorage = JSON.parse(
    Buffer.from(
      //@ts-ignore
      contents.data.content,
      //@ts-ignore
      contents.data.encoding
    ).toString()
  );

  // find non-match (==new) arXivPaper
  const newPapers = searchResults.filter(paper =>
    storage.every(record => record.id !== paper.id)
  );

  // add to storage with [candidate] status

  // check for debug
  //// for current view
  console.log(
    searchResults.map(paper => ({ id: paper.id, title: paper.title }))
  );
  console.log(storage);
  console.log(newPapers);
}

run();
