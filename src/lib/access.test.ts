import { describe, expect, it } from "vitest";
import { canEdit, canShare, canView, getRole, roleLabel } from "./access";
import type { DocumentRecord } from "./types";

const doc: DocumentRecord = {
  id: "d1",
  title: "Spec",
  contentHtml: "<p></p>",
  ownerId: "owner",
  shares: [
    { userId: "editor", access: "editor" },
    { userId: "viewer", access: "viewer" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("document access", () => {
  it("resolves roles", () => {
    expect(getRole(doc, "owner")).toBe("owner");
    expect(getRole(doc, "editor")).toBe("editor");
    expect(getRole(doc, "viewer")).toBe("viewer");
    expect(getRole(doc, "stranger")).toBeNull();
  });

  it("limits what each role can do", () => {
    expect(canView(getRole(doc, "stranger"))).toBe(false);
    expect(canEdit(getRole(doc, "viewer"))).toBe(false);
    expect(canEdit(getRole(doc, "editor"))).toBe(true);
    expect(canShare(getRole(doc, "editor"))).toBe(false);
    expect(canShare(getRole(doc, "owner"))).toBe(true);
  });
});

describe("roleLabel", () => {
  it("describes each role in plain words", () => {
    expect(roleLabel("owner")).toBe("Owner");
    expect(roleLabel("editor")).toBe("Can edit");
    expect(roleLabel("viewer")).toBe("Can view");
  });
});
