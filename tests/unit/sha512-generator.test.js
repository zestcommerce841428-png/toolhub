import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { sha512 } from "../../tools/sha512-generator/logic.js";

describe("sha512", () => {
  test("produces a 128-character hex string", async () => {
    assert.equal((await sha512("anything")).length, 128);
    assert.match(await sha512("anything"), /^[0-9a-f]{128}$/);
  });
  test("is deterministic", async () => {
    assert.equal(await sha512("ToolHub"), await sha512("ToolHub"));
  });
  test("different input produces different hash", async () => {
    assert.notEqual(await sha512("ToolHub"), await sha512("toolhub"));
  });
});
