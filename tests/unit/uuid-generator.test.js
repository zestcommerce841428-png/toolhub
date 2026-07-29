import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateUuidV4, generateUuids, isValidUuid } from "../../tools/uuid-generator/logic.js";

describe("generateUuidV4", () => {
  test("matches the canonical 8-4-4-4-12 format", () => {
    const uuid = generateUuidV4();
    assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test("sets the version nibble to 4", () => {
    const uuid = generateUuidV4();
    assert.equal(uuid[14], "4");
  });

  test("sets the variant bits to 10xx (8, 9, a, or b)", () => {
    const uuid = generateUuidV4();
    assert.match(uuid[19], /[89ab]/);
  });

  test("two consecutive UUIDs are (almost certainly) different", () => {
    assert.notEqual(generateUuidV4(), generateUuidV4());
  });
});

describe("generateUuids", () => {
  test("generates the requested count", () => {
    assert.equal(generateUuids(10).length, 10);
  });

  test("uppercase option", () => {
    const [uuid] = generateUuids(1, { uppercase: true });
    assert.equal(uuid, uuid.toUpperCase());
  });

  test("hyphens: false strips hyphens and yields 32 hex characters", () => {
    const [uuid] = generateUuids(1, { hyphens: false });
    assert.equal(uuid.includes("-"), false);
    assert.equal(uuid.length, 32);
  });
});

describe("isValidUuid", () => {
  test("accepts a well-formed UUID", () => {
    assert.equal(isValidUuid("123e4567-e89b-12d3-a456-426614174000"), true);
  });
  test("accepts uppercase", () => {
    assert.equal(isValidUuid("123E4567-E89B-12D3-A456-426614174000"), true);
  });
  test("rejects malformed input", () => {
    assert.equal(isValidUuid("not-a-uuid"), false);
    assert.equal(isValidUuid(""), false);
  });
});
