import * as core from "@actions/core";
import * as github from "@actions/github";
import { searchArXiv } from "./arXivSearch";
import {
  ArXivStorage,
  ArXivSearchResults,
  ArXivRecord,
  SearchedPaper,
  Identity,
} from "./domain";
import { tweet } from "./twitter";
import { arXivID2identity } from "./updateArticles";

function findNewPaper(
  searchResults: ArXivSearchResults,
  storage: ArXivStorage
): [SearchedPaper, ArXivRecord] | undefined {
  // find non-match (==new) arXivPaper (version update is excluded)
  const newPapers = searchResults.filter((paper) => {
    const articleID = arXivID2identity(paper.id).article;
    return storage.every((record) => record.id.article !== articleID);
  });
  if (newPapers.length === 0) {
    return undefined;
  } else {
    const theNewPaper = newPapers[0];
    const identity = arXivID2identity(theNewPaper.id);
    return [
      theNewPaper,
      {
        id: identity,
        status: "candidate",
      },
    ];
  }
}

/**
 * Find versionUp-ed paper in arXiv
 */
function findUpdatedPaper(
  searchResults: ArXivSearchResults,
  storage: ArXivStorage
): [SearchedPaper, Identity] | undefined {
  //
  const updatedPaperCand = searchResults.find((paper) => {
    const paperID = arXivID2identity(paper.id);
    // There is a record which match the articleID but not match version in storage
    return storage.some(
      (record) =>
        record.id.article === paperID.article &&
        record.id.version !== paperID.version
    );
  });
  if (updatedPaperCand === undefined) {
    return undefined;
  } else {
    const identity = arXivID2identity(updatedPaperCand.id);
    return [updatedPaperCand, identity];
  }
}

async function run(): Promise<void> {
  // fetch search result
  const searchResults = await searchArXiv();

  // fetch storage
  const octokit = github.getOctokit(core.getInput("token"));
  const contents = await octokit.rest.repos.getContent({
    ...github.context.repo,
    path: "arXivSearches.json",
  });
  const storage: ArXivStorage = JSON.parse(
    Buffer.from(
      //@ts-ignore
      contents.data.content,
      //@ts-ignore
      contents.data.encoding
    ).toString()
  );

  const newPaperCand = findNewPaper(searchResults, storage);
  if (newPaperCand !== undefined) {
    const theNewPaper = newPaperCand[0];
    const newRecord = newPaperCand[1];
    // storage update
    storage.push(newPaperCand[1]);
    // commit storage update
    const blob = Buffer.from(JSON.stringify(storage, undefined, 2));
    await octokit.rest.repos
      .createOrUpdateFileContents({
        ...github.context.repo,
        path: "arXivSearches.json",
        message: `Add new arXiv search result ${newRecord.id.article}`,
        content: blob.toString("base64"),
        // @ts-ignore
        sha: contents.data.sha,
      })
      .catch((err) => core.setFailed(err));
    console.log("storage updated.");

    // open candidate check issue
    await octokit.rest.issues
      .create({
        ...github.context.repo,
        title: `'Voice Conversion' paper candidate ${newRecord.id.article}`,
        body: `Please check whether this paper is about 'Voice Conversion' or not.\n## article info.\n- title: **${theNewPaper.title}**\n- summary: ${theNewPaper.summary}\n- id: ${theNewPaper.id}\n## judge\nWrite [vclab::confirmed] or [vclab::excluded] in comment.`,
      })
      .catch((err) => core.setFailed(err));
    console.log("issue created.");

    // tweet candidate info
    await tweet(
      `[new VC paper candidate]\n"${theNewPaper.title}"\narXiv: arxiv.org/abs/${newRecord.id.article}`,
      core.getInput("twi-cons-key"),
      core.getInput("twi-cons-secret"),
      core.getInput("twi-token-key"),
      core.getInput("twi-token-secret")
    )
      .then((res) => {
        console.log(res.status);
        return res.text();
      })
      .catch((err) => {
        core.setFailed(err);
      });
    console.log("tweet created.");
    return;
  }

  // paper update (if newPaper, already returned after Tweet)
  const updatedPaperCand = findUpdatedPaper(searchResults, storage);
  if (updatedPaperCand !== undefined) {
    const updatedPaper = updatedPaperCand[0];
    const paperID = updatedPaperCand[1];
    // storage update (version only update)
    const indexInStorage = storage.findIndex(
      (record) => record.id.article === paperID.article
    );
    if (indexInStorage === -1) {
      throw new Error("this should exist");
    }
    const record = storage[indexInStorage];
    record.id.version = paperID.version;

    // commit storage update
    const blob = Buffer.from(JSON.stringify(storage, undefined, 2));
    await octokit.rest.repos
      .createOrUpdateFileContents({
        ...github.context.repo,
        path: "arXivSearches.json",
        message: `Update arXiv search result ${paperID.article}@${paperID.version}`,
        content: blob.toString("base64"),
        // @ts-ignore
        sha: contents.data.sha,
      })
      .catch((err) => core.setFailed(err));
    console.log("storage updated (version update)");

    // do NOT open issue because version up do not change "VC paper or not"

    // tweet candidate info
    await tweet(
      `[paper version up]\n"${updatedPaper.title}"\narXiv: arxiv.org/abs/${paperID.article}`,
      core.getInput("twi-cons-key"),
      core.getInput("twi-cons-secret"),
      core.getInput("twi-token-key"),
      core.getInput("twi-token-secret")
    )
      .then((res) => {
        console.log(res.status);
        return res.text();
      })
      .catch((err) => {
        core.setFailed(err);
      });
    console.log("tweet created.");
    return;
  }
}

run();
