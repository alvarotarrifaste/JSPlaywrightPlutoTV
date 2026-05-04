/**
 * cucumber.js — Central Cucumber configuration
 *
 * This file tells Cucumber:
 *   - Where to find feature files (.feature)
 *   - Where to find step definitions and support files (.js)
 *   - Which report format to use
 *   - How many scenarios to run in parallel
 *   - The global timeout per step (also overridden in support/world.js)
 */

module.exports = {
  default: {
    // Files Cucumber must load before running tests:
    // support/**/*.js → world.js and hooks.js (browser configuration)
    // step-definitions/**/*.js → Given/When/Then implementations
    require: ['support/**/*.js', 'step-definitions/**/*.js'],

    // Where the feature files are (the .feature files with Gherkin scenarios)
    paths: ['features/**/*.feature'],

    // Report formats:
    // 'progress-bar' → shows a progress bar in the terminal
    // 'html:reports/cucumber-report.html' → generates a visual HTML report
    format: ['progress-bar', 'html:reports/cucumber-report.html'],

    // Number of parallel workers. With 1, scenarios run one at a time.
    // Increasing this number runs several scenarios simultaneously (useful in CI).
    parallel: 1,

    // Global timeout in ms. Overridden by setDefaultTimeout() in support/world.js.
    // Kept here as documentation reference.
    timeout: 30000
  }
};
