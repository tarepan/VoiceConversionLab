import core from "@actions/core";
import { tweet } from "./twitter";

try {
  // `who-to-greet` input defined in action metadata file
  (async (): Promise<void> => {
    await tweet(
      new Date().toTimeString(),
      core.getInput("twi-cons-key"),
      core.getInput("twi-cons-secret"),
      core.getInput("twi-token-key"),
      core.getInput("twi-token-secret")
    );
  })();
} catch (error) {
  core.setFailed(error.message);
}
