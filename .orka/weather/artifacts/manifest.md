brief.md [1] - project brief: confirmed scope post-Discovery — vanilla JS PWA, geolocation, Open-Meteo, Lucide icons, light/dark themes, no backend
api-research.md [1] - Open-Meteo API endpoints/parameters/WMO codes/sample JSON, ZIP geocoding options, NWS alternative
discovery.md [1] - discovery findings: API, icons, radar, PWA, build tooling, theming — stack confirmed, ready for decomposition
prototype-questions.md [2] - three decisions for human review after seeing the prototype: layout feel, icon color treatment, app icon pick
decomposition.md [9] - decomposition map: 13 pieces, contracts, dependency tiers, boundary risks — added Weather Provider seam (Piece 5), Open-Meteo Client (Piece 6), condition-based accent colors on Icon Resolver (Piece 7)
build-status.md [10] - all 13 pieces implemented; deferred: PWA icons (public/icons/*.png) needed before store submission
integration-findings.md [12] - UAT pass (no regressions), canvas remap plumbing added, pixel audit confirmed exact-match sufficient, production build verified
radar-color-schemes.md [12] - RainViewer color scheme situation: free API limitation, full Universal Blue LUT, canvas remap approach, what's left to build
build-status.md [13] - header order swap, 7-day strip layout fix (no scroll/wrap), hourly detail panel with per-day click-to-select; all 159 tests pass
