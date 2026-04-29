Feature: Playback Validation From Hero Carousel - On Demand Page
  As a PlutoTV user
  I want to navigate to the On Demand section and start VOD playback from the hero carousel
  So that I can quickly start watching on-demand content without additional navigation

  @on-demand-page
  Scenario: PlaybackValidationFromHeroCarouselOnDemandPage
    Given I open the PlutoTV home page
    When I click the "On Demand" navigation button
    And I click the "Details" button on the hero carousel
    And I click the "Watch Now" button on the details page
    Then the video player should be displayed in full screen
    And the playback should be active
