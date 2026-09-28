const test = require("node:test");
const assert = require("node:assert/strict");

const config = require("../electron-builder.linux.cjs");

test("Linux packages cover AppImage and tar.gz without forcing Chromium sandbox off", () => {
  assert.deepEqual(config.linux.target, ["AppImage", "tar.gz"]);
  assert.deepEqual(config.appImage.executableArgs, []);
  assert.equal(config.linux.executableName, "irflow-timeline");
});

test("local Linux builds do not infer the upstream repository as an update feed", () => {
  assert.equal(config.publish, null);
});
