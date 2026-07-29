import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseItems, pickRandom, splitIntoTeams } from "../../tools/random-picker/logic.js";

describe("parseItems", () => {
  test("splits on newlines and trims whitespace", () => {
    assert.deepEqual(parseItems(" Alice \nBob\n  Carol  "), ["Alice", "Bob", "Carol"]);
  });
  test("filters out blank lines", () => {
    assert.deepEqual(parseItems("Alice\n\n  \nBob"), ["Alice", "Bob"]);
  });
  test("empty input produces an empty list", () => {
    assert.deepEqual(parseItems(""), []);
  });
});

describe("pickRandom", () => {
  test("picks the requested number of items", () => {
    const result = pickRandom(["a", "b", "c", "d", "e"], 3);
    assert.equal(result.ok, true);
    assert.equal(result.picked.length, 3);
  });
  test("picked items are unique (drawn without replacement)", () => {
    const result = pickRandom(["a", "b", "c", "d", "e"], 5);
    assert.equal(new Set(result.picked).size, 5);
  });
  test("every picked item came from the original list", () => {
    const items = ["a", "b", "c"];
    const result = pickRandom(items, 2);
    assert.ok(result.picked.every((item) => items.includes(item)));
  });
  test("rejects picking more items than exist", () => {
    const result = pickRandom(["a", "b"], 3);
    assert.equal(result.ok, false);
  });
  test("rejects an empty list", () => {
    assert.equal(pickRandom([], 1).ok, false);
  });
  test("rejects a non-positive count", () => {
    assert.equal(pickRandom(["a"], 0).ok, false);
  });
});

describe("splitIntoTeams", () => {
  test("splits into the requested number of teams", () => {
    const result = splitIntoTeams(["a", "b", "c", "d"], 2);
    assert.equal(result.ok, true);
    assert.equal(result.teams.length, 2);
  });
  test("every item appears exactly once across all teams", () => {
    const items = ["a", "b", "c", "d", "e"];
    const result = splitIntoTeams(items, 2);
    const allTeamMembers = result.teams.flat();
    assert.equal(allTeamMembers.length, items.length);
    assert.deepEqual([...allTeamMembers].sort(), [...items].sort());
  });
  test("teams are as evenly sized as possible", () => {
    const result = splitIntoTeams(["a", "b", "c", "d", "e"], 2);
    const sizes = result.teams.map((team) => team.length).sort();
    assert.deepEqual(sizes, [2, 3]);
  });
  test("rejects more teams than items", () => {
    assert.equal(splitIntoTeams(["a", "b"], 3).ok, false);
  });
  test("rejects an empty list", () => {
    assert.equal(splitIntoTeams([], 1).ok, false);
  });
});
