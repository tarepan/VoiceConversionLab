import * as core from "@actions/core";
import { tweet } from "./twitter";

(async (): Promise<void> => {
  await tweet(
    `hello, new world ! ${new Date().toTimeString()}`,
    core.getInput("twi-cons-key"),
    core.getInput("twi-cons-secret"),
    core.getInput("twi-token-key"),
    core.getInput("twi-token-secret")
  )
    .then(res => {
      console.log(res.status);
      return res.text();
    })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
      core.setFailed(err.message);
    });
})();
