module.exports = {
  default: {
    require: ['support/**/*.js', 'step-definitions/**/*.js'],
    paths: ['features/**/*.feature'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    parallel: 1,
    timeout: 30000
  }
};
