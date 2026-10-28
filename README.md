# Pluto TV web journeys

A focused JavaScript + Playwright + Cucumber BDD UI automation project against [Pluto TV's public US website](https://pluto.tv/us/home/). Gherkin describes the journeys; Page Objects contain browser interactions; steps own assertions.

## Coverage

Four scenarios, each with a fresh browser:

| Tag | Journey |
| --- | --- |
| `@live-tv` | Home live-channel card → selected channel/player |
| `@vod` | Home featured title → Details → Play Now → on-demand player |
| `@live-tv-page` | Live TV guide → channel details → Watch Channel → selected channel/player |
| `@on-demand-page` | Movies catalog → movie details → Play Now → on-demand player |

Movies is the current on-demand movie catalog. Content titles are selected from the public page rather than hardcoded.

## Run

Use Node.js 22, npm, and a network location that can access the US site.

```bash
git clone https://github.com/alvarotarrifaste/JSPlaywrightPlutoTV.git
cd JSPlaywrightPlutoTV
npm ci
npx playwright install chromium
npm run test:dry-run
npm test
```

On Linux, use `npx playwright install --with-deps chromium` to install browser system dependencies.

```bash
npm run test:headed
npm test -- --tags @vod
```

Headed mode needs a desktop. Use any tag from the table to run one scenario. Every run generates `reports/cucumber-report.html`.

## Structure

```text
features/             # home, live-tv, on-demand Gherkin
pages/                # HomePage, LiveTvPage, MoviesPage, DetailsPage, PlayerPage
step-definitions/     # navigation, selection, playback assertions
support/world.js      # per-scenario browser/context/page
support/hooks.js      # lifecycle and failure evidence
cucumber.js           # discovery and reporting
.github/workflows/    # GitHub Actions
```

Cucumber runs the scenarios, Playwright controls Chromium, and Node's built-in assert module provides assertions.

## Playback oracle

Tests verify the selected channel route or title's opened player, then scope the video to that Live TV or on-demand container. Two observations must show the same media source, over one second of media-time advancement, and over 15 additional displayed frames (total minus dropped frames), without a media error. Both observations are attached to the report.

This demonstrates browser media progression on the selected surface. Advertisements can satisfy the check; it does not prove programme playback, successful DRM, or audiovisual quality. A blob URL or `NETWORK_LOADING` alone proves neither DRM nor playback. See [HTML media states](https://html.spec.whatwg.org/multipage/media.html#network-states).

## Synchronization and limits

The Home hero uses its available Details action. There is no guessed slide count or fixed sleep; missing featured content produces an explicit failure.

The Cucumber step cap remains 60 seconds. Navigation/actions have bounded waits; media gets up to 20 seconds for decoded data and 30 seconds for progression. Retries are disabled.

A regional redirect fails explicitly: locale sets language, not IP-based availability. Public promotions, ads, content rights, connectivity, and UI changes affect reliability. Ads may replace or reset media; samples restart within the original 30-second observation window, not a new timeout. The project uses public browser evidence only.

## CI and diagnostics

[GitHub Actions](https://github.com/alvarotarrifaste/JSPlaywrightPlutoTV/actions/workflows/e2e-tests.yml) runs on branch pushes and PRs to `main`: Node 22 → `npm ci` → Chromium/system dependencies → Cucumber dry run → whitespace check → full suite. Local and CI browser settings match, without custom user agents or automation-hiding options.

Artifacts retain the HTML report and failure PNGs for 14 days. Failures attach a screenshot, page URL, and media state. Browser cleanup runs even when diagnostics fail.
