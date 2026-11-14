# kaiHEN Docs

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the user: Astro static documentation pages with a separate Cloudflare Worker fetch handler for MCP and documentation APIs. The user selected code-first design. This project is separate from the parent Moader application's local browser companion.

## Users

Developers building native Switch 2 homebrew applications with kaiHEN, libounce, OunceVK and ounce-devkit. They need practical setup, API, architecture, porting and debugging guidance while writing code.

## Product Purpose

Turn the existing in-depth research into an accessible public development reference, with searchable guides, useful examples, precise source links and an MCP endpoint that lets compatible clients search and retrieve the same documentation.

## Operating Context

Readers use a desktop beside their editor and console, or a phone to check a command or API detail. The requested production hostname is kaihen.timsfun.com, deployed through Cloudflare Workers in the user's account.

## Capabilities and Constraints

Use the historical guides in content/research as the source collection, preserving source provenance and the difference between declarations, source review and hardware verification. Add usable documentation navigation and integration instructions. MCP is read-only documentation access; it does not control a console. Public content must exclude private local device records, credentials and unrelated runtime data. The public source repository is H644b/kaihen-docs on GitHub; link it from the site as the source.

The existing research is dated November 13, 2026. Publication is on November 14, 2026. A publication date does not imply all upstream compatibility claims were re-tested.

## Brand Commitments

The user explicitly requested Impeccable and a code-first build. The user explicitly asked to refrain from AI-like elements. The interface should read as a carefully made developer reference, without synthetic product claims or decorative AI motifs.

## Evidence on Hand

content/research contains the guides, source identities and a sanitized verification record with repository pins, release digests and original host-test results. Those records do not establish new console testing by this site project.

## Product Principles

- Make common development tasks easy to find and follow.
- Keep source versions and verification scope attached to technical claims.
- Use the same content for human readers and MCP clients.
- Keep deep links stable and code copyable.
- Preserve reading clarity on desktop and mobile.
