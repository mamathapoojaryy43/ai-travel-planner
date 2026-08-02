import { runBatchDestinationValidationTest, ALL_TEST_DESTINATIONS } from "../utils/destinationValidator";

async function main() {
  console.log(`Starting validation for ${ALL_TEST_DESTINATIONS.length} worldwide destinations...`);
  const result = await runBatchDestinationValidationTest(ALL_TEST_DESTINATIONS);
  console.log(`Results: ${result.totalPassed} / ${result.totalTested} PASSED.`);
  if (result.totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
