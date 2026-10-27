Feature: Choose a live channel
  As a public Pluto TV user
  I want to choose a channel from the Live TV guide

  @live-tv-page
  Scenario: Change the channel from the Live TV guide
    Given I open the Pluto TV US home page
    When I open Live TV
    And I choose another channel from the guide
    Then the selected live channel should open in the player
    And media should progress in the selected player
