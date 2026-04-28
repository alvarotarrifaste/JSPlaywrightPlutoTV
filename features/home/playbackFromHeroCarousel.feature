Feature: Playback Validation From Hero Carousel
  As a PlutoTV user
  I want to initiate playback directly from the hero carousel on the home page
  So that I can quickly access Live TV or VOD content without additional navigation

  @live-tv
  Scenario: PlaybackValidationFromHeroCarousel - Live TV
    Given I open the PlutoTV home page
    When I click the "Watch Live" button on the hero carousel
    Then the video player should be displayed in full screen
    And the playback should be active

  @vod
  Scenario: PlaybackValidationFromHeroCarousel - VOD
    Given I open the PlutoTV home page
    When I click the "Play Now" button on the hero carousel
    Then the video player should be displayed in full screen
    And the playback should be active
