---
name: kaiHEN Docs
description: A restrained development manual with readable articles, navigable chapters, and copyable code.
colors:
  canvas: "#ffffff"
  rail: "#f6f8f8"
  subtle: "#f3f5f6"
  code: "#f6f8fa"
  ink: "#242d34"
  muted: "#58646d"
  faint: "#69747d"
  line: "#e1e6e8"
  accent: "#216149"
  accent-hover: "#174c38"
  selected: "#e8f1ec"
  focus: "#287c5e"
  selection: "#cde5d7"
  danger: "#a12c2c"
  dark-canvas: "#161b1e"
  dark-rail: "#191f23"
  dark-subtle: "#20282d"
  dark-code: "#1b2227"
  dark-ink: "#e4e9ec"
  dark-muted: "#b3bec5"
  dark-faint: "#9aaab4"
  dark-line: "#354047"
  dark-accent: "#a0d4b8"
  dark-accent-hover: "#c3e8d3"
  dark-selected: "#263d33"
  dark-focus: "#a0d4b8"
  dark-selection: "#365c49"
  dark-danger: "#ffb5b5"
typography:
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "40px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "36px"
    fontWeight: 650
    lineHeight: 1.28
    letterSpacing: "-0.025em"
  section:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "23px"
    fontWeight: 650
    lineHeight: 1.28
    letterSpacing: "-0.017em"
  subsection:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.28
    letterSpacing: "-0.01em"
  lead:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
  shell:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
  navigation:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  metadata:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.7
  code:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  inline-code: "3px"
  compact: "4px"
  navigation: "5px"
  surface: "6px"
  dialog: "10px"
spacing:
  small-gap: "6px"
  control-gap: "10px"
  compact-inset: "12px"
  reading-gap: "20px"
  section-inset: "24px"
  wide-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.control}"
    rounded: "{rounded.surface}"
    padding: "9px 15px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.canvas}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.surface}"
    padding: "9px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.subtle}"
  button-copy:
    textColor: "{colors.muted}"
    typography: "{typography.metadata}"
    rounded: "{rounded.compact}"
    padding: "4px"
  search-trigger:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    rounded: "{rounded.surface}"
    padding: "5px 10px"
  search-field:
    textColor: "{colors.ink}"
    height: "35px"
    padding: "0px"
  chapter-link:
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    rounded: "{rounded.navigation}"
    padding: "7px 10px"
  chapter-link-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent}"
  code-panel:
    backgroundColor: "{colors.code}"
    rounded: "{rounded.surface}"
  guide-directory-row:
    textColor: "{colors.ink}"
    padding: "18px 0px"
  search-result:
    rounded: "{rounded.surface}"
    padding: "12px"
  search-result-hover:
    backgroundColor: "{colors.selected}"
---

# Design System: kaiHEN Docs

## Overview

**Creative North Star: "The Release Engineering Manual"**

This system gives a developer a quiet place to read beside an editor. White article space, a cool-gray chapter rail, charcoal text, and restrained forest-green actions make the document hierarchy visible without adding a decorative layer. The same platform reading stack carries headings and prose; commands and identifiers use monospace.

The implemented world uses fine rules, compact controls, divided lists, and locally scrollable technical material. Its form comes from the recorded, explicitly assumed code-first direction; there is no approved visual comp. This document captures the finished source, rather than upgrading that assumption into user approval.

**Key Characteristics:**

- Clear chapter and section navigation around a continuous article.
- Flat reading surfaces with one elevated search overlay.
- Source references, technical identifiers, and copyable commands close to their context.
- Compact controls with visible keyboard focus and responsive reading space.

Source of truth: `src/styles/global.css`, `src/layouts/DocsLayout.astro`, `src/components/Navigation.astro`, `src/components/Icon.astro`, `src/pages/index.astro`, `src/pages/docs/[slug].astro`, and `src/scripts/site.ts`. Token values above describe the light theme; `dark-*` entries describe the semantic replacements applied by the dark theme. Component references use the light primitives unless noted below. The sidecar extends these tokens with previews, motion, breakpoints, and metadata. Its generated tonal ramps are preview aids; they do not add colors to the implemented palette.

## Colors

The palette combines cool neutral reading surfaces with one green action family and a reserved error color. The frontmatter owns exact values.

### Primary

- **Forest Green** (`accent`) identifies links, primary actions, selected navigation, and small functional SVG marks. **Deep Forest** (`accent-hover`) strengthens hover states.
- **Focus Green** (`focus`) draws keyboard outlines and the search field's focus edge.
- **Pale Green Location** (`selected`) grounds the current chapter and hovered search result. **Selection Green** (`selection`) marks selected text and matching search words.
- The corresponding `dark-*` roles use lighter green text and darker green grounds. The filled primary button retains its light-theme forest background, hover background, and white label in both themes; it does not follow the dark accent swap.

### Neutral

- **White Article** (`canvas`) is the document and header ground. **Cool Chapter Gray** (`rail`) groups navigation and quiet inset content.
- **Soft State Gray** (`subtle`) supports hover states and inline code. **Code Gray** (`code`) separates command panels and endpoint rows from prose.
- **Charcoal** (`ink`) carries reading text and headings. **Slate** (`muted`) carries secondary copy and navigation. **Quiet Slate** (`faint`) supports secondary affordances and search-trigger hover borders.
- **Fine Rule** (`line`) separates sections, panels, and rails. Dark counterparts preserve these distinctions on charcoal grounds.
- **Error Red** (`danger`, `dark-danger`) is reserved for a failed MCP connection result.

**The Link and Location Rule.** Use green for actionable destinations, current location, keyboard focus, and text matches; keep reading copy and structural rules neutral.

## Typography

**Reading and heading font:** the platform stack in the frontmatter. **Code and keyboard font:** the monospace stack in the frontmatter. No webfont is required.

**Character:** a continuous reading voice with compact navigation and denser technical examples. Headings use moderate weight and slightly tightened tracking. Labels retain ordinary sentence case.

### Hierarchy

- **Headline:** the home heading uses the `headline` role. Its responsive sizes are 35px at 960px and below, 34px at 800px and below, 33px at 500px and below, and 30px at 350px and below.
- **Title:** guide titles use `title`, reducing to 31px at 800px and below.
- **Section / subsection:** article headings use `section` and `subsection`; section headings reduce to 22px at 800px and below. Home section headings use 21px with the shared heading weight and line height.
- **Lead / body:** the introduction uses `lead`, reducing to 17px at 800px and below. Long-form articles use `body`; paragraphs and lists stop at 75ch where space allows. Page descriptions use 16px with a 1.65 line height, reducing to 15px at 800px and below.
- **Control / navigation / label / metadata:** buttons, chapter links, group labels, and research details use their separate frontmatter roles. Metadata reduces to 10px in article headers and footers at 500px and below.
- **Code:** fenced examples use `code`, reducing to 11px at 500px and below. Inline code uses 0.87em of its surrounding text; table code uses 11px. Disable monospace ligatures. Tables use tabular numerals.

**The Reading Stack Rule.** Keep headings and prose in the same platform reading stack; reserve monospace for code, identifiers, and keyboard cues.

## Layout

The desktop shell has a maximum width of 1600px and three columns: a 248px chapter rail, a fluid article, and a 212px contents rail. The header is sticky, 64px high, with a brand column, a search field, and compact links. The article has a maximum width of 964px and 52px horizontal padding. Its top inset is 36px on guides and 58px on the home page. The chapter rail sticks below the header and scrolls independently; the contents rail sticks at 106px.

The spacing vocabulary is practical rather than a strict mathematical scale. Reused gaps and insets appear in frontmatter. Fine section rules, article heading margins, and code panels separate reading units; the main column remains a continuous document.

Responsive changes are structural:

- At 1280px and below, the chapter rail becomes 230px, the contents rail 184px, and article side padding 38px.
- At 1150px and below, the contents rail disappears and guides expose a disclosure for their section index. Article side padding becomes 46px; the Guides header link is hidden.
- At 960px and below, article side padding becomes 32px and the API reference header link is hidden.
- At 800px and below, the shell becomes a single column, the header becomes 58px high, the chapter index moves into a disclosure above the article, and search becomes an icon button. Article side padding becomes 24px, with a 760px maximum width. The chapter disclosure uses two columns.
- At 500px and below, article side padding becomes 20px, the chapter disclosure uses one scrollable column, the guide directory and definition rows stack, and the header Source link is hidden. Home and guide footers retain Source on GitHub.
- At 350px and below, article side padding becomes 17px and the MCP header link retains its icon while hiding its text.
- Above 1600px, header padding aligns its content with the centered shell.

Code panels, tables, and diagram frames own their horizontal overflow. Long prose and URLs may wrap. Print removes navigation, copy controls, pagination, the MCP check, and search; the article expands and uses 11pt reading text.

## Elevation & Depth

Reading surfaces are flat. A thin border and a change of neutral ground define the chapter rail, code, tables, diagram frames, and MCP connection check. Search alone is elevated above a dimmed backdrop.

### Shadow Vocabulary

- **Search overlay:** `0 20px 70px #101a2230`; paired with a `#17252d77` backdrop. These literal overlay values apply in both themes.
- **Search field focus:** `inset 0 -2px 0 var(--focus)`; an inset focus edge, not surface elevation.

**The Flat Page Rule.** Keep document surfaces flat and separated by fine rules or tonal grounds; reserve the ambient shadow for the modal search layer.

## Shapes

Most bounded technical surfaces and full-size controls use the `surface` radius. Chapter items and icon buttons use the smaller `navigation` radius; copy controls and keyboard cues use `compact`; inline code uses `inline-code`. Search has the larger `dialog` radius. Borders are one pixel. Directory links are divided rows rather than individually bounded panels.

Functional icons are authored inline SVG with a 20-unit viewBox, a 1.5-unit stroke, and rounded caps and joins. The brand mark has its own 28-unit viewBox and 2.2-unit stroke. Raster imagery is not part of the shipped interface.

## Components

### Buttons

Compact, plain controls use `control` typography, a 40px minimum height, a 10px icon gap, and the frontmatter padding and radius. The filled primary action uses fixed forest and white in both themes. Secondary actions use the theme's canvas, ink, and border, changing to the subtle ground on hover. Transparent text actions underline on hover. Icon buttons are 34px square; disabled controls reduce opacity to 0.65 and use the wait cursor.

All focusable controls inherit a 2px focus outline with a 4px offset. No general hover transition or pressed transform is defined.

### Copy controls

Code headers, endpoint rows, and article metadata use compact transparent copy buttons with a small SVG and optional text. Hover adds the subtle ground and accent text. Successful copying changes the text to “Copied” immediately, announces success through a live status region, and restores the label after 1800ms. Failure announces manual-copy guidance. Page copying disables its button while fetching Markdown. On narrow endpoint rows the Copy label is hidden while the accessible name remains.

### Search trigger and field

The desktop trigger has a quiet rail ground, a fine border, a search icon, and a keyboard cue. Hover strengthens its border. At 800px and below it becomes a bare 36px icon control. The actual search input is borderless, 35px high, and 15px in the reading stack; its surrounding row receives the inset focus edge.

### Search overlay and results

The native modal dialog is at most 650px wide, otherwise the viewport width minus 32px; it opens 11vh from the top and is at most 76vh high. The results pane scrolls independently at 55vh. Results show guide name, section title, and excerpt; matching text receives the selection ground. Hover and focus apply the selected ground.

The trigger and Command/Ctrl+K open search and focus the field. Arrow keys move between the field and results; Enter activates a result. Close, Escape, and backdrop activation dismiss it. Activating a same-page result closes the modal, updates the fragment, focuses the target heading, and scrolls it into view. Loading, no-match, and failed-index states provide plain guidance.

The opening animation is exactly 160ms with `ease-out`, translating from 5px above to rest. Article content has no entrance animation. Reduced-motion preference removes animations and transitions.

### Navigation

Chapter links use quiet text, compact insets, and small rounded corners. Hover adds subtle ground and ink; the selected page uses the green location ground, accent text, weight 600, and `aria-current="page"`. Group headings remain compact reading labels. The contents rail uses a single left rule; its active section uses accent text and weight 600, with `aria-current="location"` updated during reading. Mobile chapter and inline contents controls use native disclosures.

The source destination is centralized in `src/lib/content.ts` and linked from the desktop header and every home or guide footer. The theme control swaps the semantic palette, updates its accessible label, and persists the selected theme locally; the initial fallback is light.

### Technical containers

Code panels use the code ground, a fine border, and the shared surface radius. A compact header contains the language and copy action; the code inset is 16px vertically and 18px horizontally, becoming 14px on narrow screens. Tables use a quiet header, fine row rules, and a local scrolling frame. Diagrams use a rail-ground frame and a muted centered caption; Mermaid is initialized with the reading stack and the theme present at render time. The MCP connection panel uses the same flat frame, a secondary button, disabled checking state, and a live success or error message.

### Guide directory and continuation

The home directory uses two columns of divided links, with a title, small arrow, and muted description. It becomes one column at 500px and below. Previous and next guide links are separated from the article by a rule and align to opposite sides. Footers wrap naturally and keep repository and Markdown destinations visible.

## Do's and Don'ts

### Do:

- **Do** use the shared reading stack, restrained green action family, fine rules, and existing semantic theme roles.
- **Do** keep technical overflow inside code, table, and diagram frames while allowing the article to wrap.
- **Do** keep keyboard focus visible and move it to a same-page search destination after closing the dialog.
- **Do** preserve source access in home and guide footers at narrow widths.
- **Do** keep source versions and evidence labels close to the technical material they qualify.

### Don't:

- **Don't** add decorative AI motifs or synthetic product claims.
- **Don't** animate article content into view or add decorative entrance sequences.
- **Don't** replace the functional inline SVG marks with text glyph icons.

Recorded drift, not canonized: the direction contract proposes 160ms copy confirmation transitions; the implemented copy controls change labels immediately and reset after 1800ms. No copy animation rule is established here, and this documentation pass does not alter product code.
