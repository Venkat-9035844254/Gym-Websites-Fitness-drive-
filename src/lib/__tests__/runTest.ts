import { runReminderTestSuite } from "./reminderSuite.test";

runReminderTestSuite()
  .then(() => {
    console.log("SUCCESS: Automated test suite completed!");
  })
  .catch((err) => {
    console.error("FAILURE: Test suite encountered an error:", err);
    process.exit(1);
  });
