@diagnostic
Feature: Verify failure evidence
  Scenario: Capture a controlled failure
    Given I open the Pluto TV US home page
    Then a controlled diagnostic failure is raised
