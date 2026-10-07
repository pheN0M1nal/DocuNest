# Product and Engineering Quality

## Goals

- Validate all server action input with zod and return clear errors
- Handle errors in the UI: failed save, missing document, bad upload
- Automated tests for access rules, store, and import (already started), plus the sharing flow
- Deploy a public URL reviewers can use with the seeded accounts
- README with local setup, run, and review accounts
- ARCHITECTURE.md: what was prioritized and why
- AI_WORKFLOW.md: tools used, where AI helped, what was changed or rejected, how it was verified
- SUBMISSION.md: exact list of included files, what works, what is incomplete, next steps
- `walkthrough-video.txt` with the Loom/YouTube URL

## Notes

- Brief: `context/ask/assignment.md`; time box is 4-6 hours, so cut scope deliberately and say so
- Walkthrough video is 3-5 minutes: main flow, what works, what was cut, key decisions, AI usage
- Stretch is optional: export to Markdown is the cheapest
- Run `npm run lint`, `npm test`, and `npm run build` before each commit
