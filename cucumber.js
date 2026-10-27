module.exports = {
  default: {
    require: ['support/**/*.js', 'step-definitions/**/*.js'],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    retry: 0,
  },
};
