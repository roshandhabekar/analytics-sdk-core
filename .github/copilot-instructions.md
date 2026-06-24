<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the implementation plan:

specs/003-rename-sdk-package/plan.md

Key technical details:
- Documentation consistency update (Markdown files, JSON configurations)
- Find-and-replace operation across ~20 files
- Zero code functionality changes - package.json files already have correct unscoped names
- Files to update: README.md, PUBLISHING.md, root package.json, packages/*/README.md, examples/*, specs/001-analytics-cdn-integration/*
- Verification via build success, test passage, and grep search for remaining @company references

Design artifacts:
- Specification: specs/003-rename-sdk-package/spec.md
- Implementation plan: specs/003-rename-sdk-package/plan.md
- Phase 0 (research): SKIPPED - no research needed
- Phase 1 (design): SKIPPED - no design artifacts needed
<!-- SPECKIT END -->
