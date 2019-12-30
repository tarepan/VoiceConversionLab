import * as core from "@actions/core";
import { tweet } from "./twitter";

(async (): Promise<void> => {
  console.log("before tweet");
  await tweet(
    `hello, new world ! ${new Date().toTimeString()}`,
    core.getInput("twi-cons-key"),
    core.getInput("twi-cons-secret"),
    core.getInput("twi-token-key"),
    core.getInput("twi-token-secret")
  )
    .then(res => {
      console.log("1st then in tweet");
      console.log(res.status);
      return res.text();
    })
    .then(res => {
      console.log("2nd then in tweet");
      console.log(res);
    })
    .catch(err => {
      console.log("error in tweet");
      console.log(err);
      core.setFailed(err.message);
    });
})();
