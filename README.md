# minimalist-ui

Agent skill for textured-minimal UI: themes, composition archetypes, generative backgrounds. Works for any site.

[Live demo](https://demo-app-eosin-phi.vercel.app/) — eight example sites built with the skill.

<table>
  <tr>
    <td width="50%"><img src="assets/contact-light.png" alt="Contact sheet of demo sites in light themes" /></td>
    <td width="50%"><img src="assets/contact-dark.png" alt="Contact sheet of demo sites in dark themes" /></td>
  </tr>
</table>

## Install

```bash
npx skills add bremsstrahlung-57/minimalist-ui-skill
```

## Usage

Example prompt: “Use the minimalist-ui skill to build a docs site for a CLI tool.” The agent chooses a voice (`nerd`, `neutral`, or `professional`), a theme, and a composition archetype for the page.

## What's different

- Ten composition archetypes are documented; major views use different archetypes within a project.
- Six theme families are included: Gruvbox, Tokyo Night, Catppuccin, Rose Pine, Nord, and Everforest.
- The optional ambient canvas has eleven modes, including Game of Life, ASCII noise, and flow fields.
- `dist/minimalist.min.css` is a standalone stylesheet; `dist/example.html` shows it in use.
- The demo has a contrast checker for theme tokens, including 4.5:1 role-pair checks and a 3:1 field-line check.

## How it works

`SKILL.md` gives the design and accessibility rules and asks the agent to inspect the current project first. The agent reads relevant files from `references/` for composition, themes, texture, components, responsive layout, and stack guidance. For standalone use, `dist/` contains the built stylesheet, the pre-paint theme script, an optional ambient module, and an example page.


## License

[MIT License](LICENSE) · Copyright (c) 2026 Sagar Sharma
