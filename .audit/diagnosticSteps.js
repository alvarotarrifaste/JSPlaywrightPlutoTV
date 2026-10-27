const { Then } = require('@cucumber/cucumber');
Then('a controlled diagnostic failure is raised', function () {
  throw new Error('Controlled failure to verify diagnostics');
});
