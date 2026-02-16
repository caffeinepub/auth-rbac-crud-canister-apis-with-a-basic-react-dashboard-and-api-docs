# Specification

## Summary
**Goal:** Remove all visible caffeine.ai branding/watermarks from the UI and eliminate any hardcoded caffeine.ai URLs, while documenting how to use a shorter/custom domain externally.

**Planned changes:**
- Remove the AppShell footer “caffeine.ai” text/link and any other user-facing mentions of “caffeine.ai” (case-insensitive) across the frontend UI.
- Search and remove/replace any hardcoded `https://caffeine.ai` links in the frontend with neutral/non-branded behavior (e.g., no external branding link).
- Update frontend documentation/README (in English) to explain that the deployed app URL is determined by IC deployment/canister and that using a shorter/custom domain requires external DNS/domain configuration at a high level (without referencing caffeine.ai).

**User-visible outcome:** The site renders without any caffeine.ai watermark/branding or links, and the documentation explains (at a high level) how a shorter/custom domain can be configured externally.
