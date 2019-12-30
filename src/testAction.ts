import "./arXivSearch";
import * as core from "@actions/core";
import github from "@actions/github";

console.log("hello, this is test act.");

async function run(): Promise<void> {
  // get arXiv

  // get database
  const octokit = new github.GitHub(core.getInput("token"));
  const contents = await octokit.repos.getContents({
    ...github.context.repo,
    path: "arXivSearches.json"
  });
  console.log(contents.data);
}

run();
