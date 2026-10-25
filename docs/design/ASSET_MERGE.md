# Asset-management conflict resolution

During verification, an external stash application introduced five conflicts and four staged asset-report files. The user explicitly authorized resolving the conflicts while preserving both changes. Only those conflict resolutions and whitespace cleanup were staged; the redesign remains uncommitted.

- Retained the existing lazy Material tabs and all six destinations, adding the incoming Reports tab and standalone component import.
- Kept the current asset-type table, delete visibility, required/whitespace/duplicate-name checks, trimming, update-versus-create branch, and custom-attribute controls.
- Integrated the incoming list-first layout and explicit Add/Cancel panel behavior using the existing validated form, rather than maintaining two incompatible forms. Cancel hides the editor; Add opens a cleared form; Edit opens the existing type.
- Preserved incoming persisted-attribute deletion through the existing service. Unsaved rows are removed locally, and failed requests leave rows intact.
- Retained incoming compact table-header styles and existing responsive table wrapper.
- The incoming Reports component is still a placeholder (`asset-reports works!`); resolving the merge does not implement a reporting feature.

Four isolated regression tests pass in `assetType.merge.spec.ts`: panel/validation behavior, updating without creating a duplicate, saved versus unsaved deletion, and failure retention. No real asset data was changed. Full development build passes; Git has no remaining unmerged files.
