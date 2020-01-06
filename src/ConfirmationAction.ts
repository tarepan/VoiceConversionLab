import * as core from "@actions/core";
import * as github from "@actions/github";
import { searchArXiv } from "./arXivSearch";
import { ArXivStorage } from "./domain";
import { tweet } from "./twitter";
import * as WebhooksApi from "@octokit/webhooks";
import { updateArticleStatus } from "./updateArticles";

async function run(): Promise<void> {
  //@ts-ignore
  const issueCommentPayload: WebhooksApi.WebhookPayloadIssueComment =
    github.context.payload;

  // extract id
  const idRegExp = /id: ([a-z\d.:\/]+)/;
  const regResult = idRegExp.exec(issueCommentPayload.issue.body);
  // regResult == null means the issue is not for article confirmation
  if (regResult != null) {
    const id = regResult[1];

    // extract judge
    const c = /\[vclab::confirmed\]|\[confirmed\]/;
    const e = /\[vclab::excluded\]|\[excluded\]/;

    const isC = c.exec(issueCommentPayload.comment.body);
    const isE = e.exec(issueCommentPayload.comment.body);

    // make thunks toward contribution
    if (isC !== null || isE !== null) {
      const octokit = new github.GitHub(core.getInput("token"));
      // reply thunks in comment
      await octokit.issues
        .createComment({
          ...github.context.repo,
          // eslint-disable-next-line @typescript-eslint/camelcase
          issue_number: issueCommentPayload.issue.number,
          body: `Thunk you very much for contribution!\nYour judgement is refrected in [arXivSearches.json](https://github.com/tarepan/VoiceConversionLab/blob/master/arXivSearches.json), and is going to be used for VCLab's activity.\nThunk you so much.`
        })
        .catch(err => core.setFailed(err));
      // close the issue
      octokit.issues.update({
        ...github.context.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        issue_number: issueCommentPayload.issue.number,
        state: "closed"
      });

      // update store
      //// fetch storage
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
      //// update storage
      const judgeResult = isC !== null ? "confirmed" : "excluded";
      const newStorage = updateArticleStatus(storage, id, judgeResult);
      //// commit storage update
      const blob = Buffer.from(JSON.stringify(newStorage));
      await octokit.repos
        .createOrUpdateFile({
          ...github.context.repo,
          path: "arXivSearches.json",
          message: `Add arXiv paper confirmation judge '${judgeResult}' toward ${id}`,
          content: blob.toString("base64"),
          // @ts-ignore
          sha: contents.data.sha
        })
        .catch(err => core.setFailed(err));

      if (isC !== null) {
        console.log("is [vclab::confirmed]");
        // const content = `[VC paper]\n"${theNewPaper.title}"\narXiv: ${theNewPaper.id}`
        const paperTitle = "test";
        const content = `[VC paper]\n"${paperTitle}"\narXiv: ${id}`;

        // tweet confirmed paper
        // working tested.
        await tweet(
          content,
          core.getInput("twi-cons-key"),
          core.getInput("twi-cons-secret"),
          core.getInput("twi-token-key"),
          core.getInput("twi-token-secret")
        )
          .then(res => {
            console.log(res.status);
            return res.text();
          })
          .catch(err => {
            core.setFailed(err);
          });
        console.log("tweet created.");
      } else if (isE !== null) {
        console.log("is [vclab::excluded]");
      }
    } else {
      console.log("non confirmation comment");
    }
  }
}

run();
