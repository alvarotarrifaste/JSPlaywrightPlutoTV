# JSPlaywrightPlutoTV

End-to-end automation framework for [PlutoTV](https://pluto.tv) web platform, built with **Playwright + JavaScript + Cucumber (BDD) + GitHub Actions**.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Playwright](https://playwright.dev) | ^1.49 | Browser automation |
| [@cucumber/cucumber](https://cucumber.io) | ^10.8 | BDD test runner |
| Node.js | 20+ | Runtime |
| GitHub Actions | — | CI/CD pipeline |

---

## Project Structure

```
JSPlaywrightPlutoTV/
├── .github/
│   └── workflows/
│       └── e2e-tests.yml          # CI pipeline (runs on push/PR to main)
│
├── features/                      # BDD feature files (Gherkin)
│   └── home/
│       └── playbackFromHeroCarousel.feature
│
├── pages/                         # Page Object Model (POM)
│   ├── HomePage.js                # Home page + hero carousel interactions
│   └── PlayerPage.js              # Video player validations
│
├── step-definitions/              # Cucumber step implementations
│   └── playbackFromHeroCarouselSteps.js
│
├── support/                       # Cucumber support files
│   ├── world.js                   # PlaywrightWorld (browser lifecycle + default timeout)
│   └── hooks.js                   # Before/After hooks (screenshot on failure)
│
├── cucumber.js                    # Cucumber configuration
├── package.json
└── .gitignore
```

---

## Setup

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm install

# Install Playwright Chromium browser
npx playwright install chromium
```

---

## Running Tests

```bash
# Headless mode (default — for CI)
npm test

# Headed mode (visible browser — for local development)
npm run test:headed

# Run only Live TV scenarios
npm test -- --tags @live-tv

# Run only VOD scenarios
npm test -- --tags @vod

# Generate HTML report
npm run test:report
```

HTML report is generated at `reports/cucumber-report.html`.

---

## Test Scenarios

### `features/home/playbackFromHeroCarousel.feature`

Validates that users can initiate playback directly from the hero carousel on the PlutoTV home page.

| Tag | Scenario | Description |
|---|---|---|
| `@live-tv` | PlaybackValidationFromHeroCarousel - Live TV | Clicks **Watch Live** on the hero carousel, validates fullscreen player opens and Live TV playback starts |
| `@vod` | PlaybackValidationFromHeroCarousel - VOD | Clicks **Play Now** on the hero carousel, validates fullscreen player opens and VOD playback starts |

---

## Architecture Decisions

### Page Object Model (POM)
Each page or component has a dedicated class under `pages/`. Steps never interact with the DOM directly — they go through page objects. This keeps step definitions readable and makes selector changes isolated to one file.

### Cucumber World (`support/world.js`)
The `PlaywrightWorld` class holds the browser, context, and page instances for the duration of each scenario. Every scenario gets a fresh browser via the `Before` hook, and the browser is closed in the `After` hook.

### Playback Detection
PlutoTV uses MPEG-DASH with Widevine DRM for VOD content (served as blob URLs). Playwright's Chromium may not fully decrypt DRM segments, so `readyState` can remain at `0`. The `waitForPlayback()` method accepts either:
- `readyState >= 3` — for Live TV (stream delivers data quickly)
- `networkState === 2` (NETWORK_LOADING) — for DRM VOD (browser is actively fetching encrypted segments, confirming playback was initiated)

### Hero Carousel Navigation
The hero carousel is dynamic — content changes between sessions. The `clickHeroCarouselButton()` method iterates through up to 10 carousel slides using the `nextButton` arrow until it finds the target CTA (`Watch Live` or `Play Now`).

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) runs on every push and pull request to `main`:
1. Checks out the code
2. Sets up Node.js 20
3. Installs npm dependencies
4. Installs Playwright Chromium with system dependencies
5. Runs the full test suite (headless)
6. Uploads the HTML report as an artifact

---

## Adding New Scenarios

1. **Create or update a `.feature` file** under `features/<section>/`:
   ```gherkin
   @my-tag
   Scenario: MyNewScenario
     Given ...
     When  ...
     Then  ...
   ```

2. **Add a Page Object** under `pages/` if the scenario touches a new page or component.

3. **Implement the steps** in `step-definitions/` — reuse existing steps wherever possible (e.g., `Given I open the PlutoTV home page` is shared across all home page scenarios).

4. **Run locally** with `npm run test:headed -- --tags @my-tag` before pushing.

---

## Author

Alvaro Tarrifa — Senior STE | [alvarotarrifa.ste@gmail.com](mailto:alvarotarrifa.ste@gmail.com)
