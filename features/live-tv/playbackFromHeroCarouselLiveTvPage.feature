Feature: Playback Validation From Hero Carousel - Live TV Page
  As a PlutoTV user
  I want to navigate to the Live TV section and start channel playback from the hero carousel
  So that I can quickly watch a live channel without additional navigation

  @live-tv-page
  Scenario: PlaybackValidationFromHeroCarouselLiveTvPage
    Given I open the PlutoTV home page
    When I click the "Live TV" navigation button
    And I click the "Watch Live Channel" button on the hero carousel
    Then the video player should be displayed in full screen
    And the playback should be active
