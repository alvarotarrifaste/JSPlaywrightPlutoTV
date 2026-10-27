Feature: Start watching from Home
  As a public Pluto TV user
  I want to open live and on-demand content from Home

  @live-tv
  Scenario: Open a live channel from Home
    Given I open the Pluto TV US home page
    When I choose an available live channel from Home
    Then the selected live channel should open in the player
    And media time and displayed frames should advance

  @vod
  Scenario: Start the featured on-demand title from Home
    Given I open the Pluto TV US home page
    When I open the featured on-demand title
    And I start watching the selected title
    Then the selected on-demand title should open in the player
    And media time and displayed frames should advance
