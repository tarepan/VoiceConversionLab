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
  if (newPapers.length > 0) {
    const theNewPaper = newPapers[0];
    storage.push({
      id: theNewPaper.id,
      status: "candidate"
    });
    // commit storage update
    await octokit.repos
      .createOrUpdateFile({
        ...github.context.repo,
        path: "arXivSearches.json",
        message: `Add new arXiv search result ${theNewPaper.id}`,
        content: new Buffer(JSON.stringify(storage)).toString("base64")
      })
      .catch(err => console.log(err));
    // open candidate check issue
    await octokit.issues
      .create({
        ...github.context.repo,
        title: `'Voice Conversion' paper candidate ${theNewPaper.id}`,
        body: `Please check whether this paper is about 'Voice Conversion' or not.\n## article info.\n- title: ${theNewPaper.title}\n- summary: ${theNewPaper.summary}\n- id: ${theNewPaper.id}\n## judge\nWrite 'confirmed' or 'excluded' in [] as comment.`
      })
      .catch(err => console.log(err));
    // tweet candidate info
  }
}

run();
