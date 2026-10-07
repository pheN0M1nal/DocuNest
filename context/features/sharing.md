# Sharing

## Goals

- Every document has one owner
- Owner can share with another seeded user as editor or viewer
- Owner can change or remove a user's access
- Documents list splits into "My documents" and "Shared with me"
- Shared documents show who shared them and the user's access level
- Users without access get a 404

## Notes

- Mocked login: seeded users in `src/lib/users.ts`, user id in an httpOnly cookie
- Permission rules live in `src/lib/access.ts`; all actions and pages must use them
- Only the owner can share; editors can edit; viewers are read-only
- Removing access is not built yet; add `unshare` to `DocumentStore`
- Test the permission matrix (owner, editor, viewer, stranger)
