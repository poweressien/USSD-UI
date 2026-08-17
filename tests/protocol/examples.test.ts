import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseScreenMessage } from "../../src/protocol/parser/parseScreenMessage";
import { validateScreenMessage } from "../../src/protocol/validator/validateScreenMessage";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(HERE, "../../specification/examples");

const EXPECTED_INVALID = new Set(["malformed-unsupported-version.json"]);
const USER_ACTION_FILES = new Set(["user-action-button.json", "user-action-input.json", "user-action-navigation.json"]);

/**
 * The specification's example payloads are documentation, but they are
 * also load-bearing: this test proves every example in
 * /specification/examples actually parses (or, for the one deliberately
 * malformed example, actually fails) against the real parser and
 * validator — so the docs can never silently drift from the schema.
 */
describe("specification examples stay in sync with the schema", () => {
  const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".json"));

  it("found the expected example files", () => {
    expect(files.length).toBeGreaterThanOrEqual(9);
  });

  for (const file of files) {
    if (USER_ACTION_FILES.has(file)) continue;

    it(`${file} ${EXPECTED_INVALID.has(file) ? "is correctly rejected" : "parses and validates"}`, () => {
      const raw = JSON.parse(readFileSync(join(EXAMPLES_DIR, file), "utf-8"));
      const parsed = parseScreenMessage(raw);

      if (EXPECTED_INVALID.has(file)) {
        expect(parsed.ok).toBe(false);
        return;
      }

      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        const validation = validateScreenMessage(parsed.message);
        expect(validation.errors).toEqual([]);
        expect(validation.valid).toBe(true);
      }
    });
  }

  for (const file of USER_ACTION_FILES) {
    it(`${file} has the shape of a UserAction`, () => {
      const raw = JSON.parse(readFileSync(join(EXAMPLES_DIR, file), "utf-8"));
      expect(["button", "input", "select", "navigation"]).toContain(raw.type);
      expect(typeof raw.id).toBe("string");
      expect(typeof raw.action).toBe("string");
    });
  }
});
