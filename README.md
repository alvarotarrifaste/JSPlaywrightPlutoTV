# Pluto TV web journeys

A focused JavaScript + Playwright + Cucumber BDD UI automation project against [Pluto TV's public US website](https://pluto.tv/us/home/). Gherkin describes user journeys; Page Objects keep browser interactions separate from step-level assertions.

## Coverage

Four scenarios, with a fresh browser per scenario:

| Tag | Journey |
| --- | --- |
| `@live-tv` | Home live-channel card → selected channel/player |
| `@vod` | Home featured title → Details → Play Now → on-demand player |
| `@live-tv-page` | Live TV navigation → choose another guide channel → selected channel/player |
| `@on-demand-page` | Movies catalog → movie details → Play Now → on-demand player |

The public UI changed from the original hero-based flows: Live TV now uses a guide, and Movies is the on-demand movie catalog. Scenarios follow these current surfaces and do not hardcode content titles.

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

On Linux, install browser system dependencies with `npx playwright install --with-deps chromium`.

```bash
npm run test:headed
npm test -- --tags @vod
npm test -- --tags @live-tv
npm test -- --tags @live-tv-page
npm test -- --tags @on-demand-page
```

Headed mode needs a desktop. Every test run generates `reports/cucumber-report.html`; no separate report command is required.

## Structure

```text
features/             # home, live-tv, on-demand Gherkin
pages/                # HomePage, LiveTvPage, MoviesPage, DetailsPage, PlayerPage
step-definitions/     # navigation, selection, playback assertions
support/world.js      # per-scenario browser/context/page
support/hooks.js      # lifecycle and failure evidence
cucumber.js           # step discovery and HTML/progress reporting
.github/workflows/    # GitHub Actions
```

Cucumber is the runner; Playwright controls Chromium. Assertions use Node's built-in assert module. There is no Playwright Test runner, base class, or custom fixture layer.

## What playback checks prove

After verifying the selected channel route or title's opened player, tests scope the video to the Live TV or on-demand player container. Two observations must show the same media source, more than one second of media-time advancement, and an increase of more than 15 displayed frames (total minus dropped frames), with no media error. Observations are attached to the report.

This proves browser media progression on that surface. It can include advertisements; it does **not** prove that the selected programme played, that DRM succeeded, or that audiovisual quality is correct. A blob URL or `NETWORK_LOADING` alone is not proof of DRM or playback. See the [HTML media states](https://html.spec.whatwg.org/multipage/media.html#network-states).

## Synchronization and limits

The Home hero uses its available Details action without cycling through a guessed number of slides or sleeping through animations. If that action is unavailable, the scenario fails with a content-specific explanation. Catalog/guide selections use current public content, accessible roles, application test IDs, and observed route/data attributes.

The 60-second Cucumber step cap is unchanged. Browser actions have bounded waits; the media step allows up to 20 seconds for decoded data and 30 seconds for progression. There are no retries or fixed sleeps.

The suite targets the English US UI. A regional redirect fails explicitly; locale does not change IP-based availability. Public promotions, ads, content rights, connectivity, and application changes can affect execution. There are no private APIs, internal test environments, or proprietary playback instrumentation.

## CI and diagnostics

[GitHub Actions](https://github.com/alvarotarrifaste/JSPlaywrightPlutoTV/actions/workflows/e2e-tests.yml) runs on branch pushes and pull requests to `main`: Node 22 → `npm ci` → Chromium/system dependencies → Cucumber dry run → whitespace check → full suite. It uses the same browser configuration as local execution, without a custom user agent or automation-hiding flags.

Artifacts retain the HTML report and failure PNGs for 14 days. Failed scenarios attach a screenshot, page URL, and media state; cleanup runs even if diagnostic capture fails.
