Feature: Watch an on-demand movie
  As a public Pluto TV user
  I want to start a movie from its details page

  @on-demand-page
  Scenario: Start a movie from the Movies catalog
    Given I open the Pluto TV US home page
    When I open Movies
    And I choose an available movie
    And I start watching the selected title
    Then the selected on-demand title should open in the player
    And media should progress in the selected player
