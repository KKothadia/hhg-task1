import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUILDER_TITLES,
  DEFAULT_SHARE_CAPTION,
  SHARE_HASHTAG,
  buildTweetIntent,
  getDownloadFilename,
  getNextBuilderTitle,
} from "./frame";

describe("buildTweetIntent", () => {
  it("uses the requested share caption when caption input is empty", () => {
    const url = new URL(buildTweetIntent(""));

    assert.equal(url.searchParams.get("text"), DEFAULT_SHARE_CAPTION);
  });

  it("keeps the hashtag in the dedicated X intent parameter", () => {
    const url = new URL(buildTweetIntent("Built at HH Goa"));

    assert.equal(url.origin + url.pathname, "https://twitter.com/intent/tweet");
    assert.equal(url.searchParams.get("text"), "Built at HH Goa");
    assert.equal(url.searchParams.get("hashtags"), SHARE_HASHTAG);
  });

  it("adds a share URL when one is provided", () => {
    const url = new URL(buildTweetIntent("Frame ready", "https://example.com/frame"));

    assert.equal(url.searchParams.get("url"), "https://example.com/frame");
  });
});

describe("getDownloadFilename", () => {
  it("returns a deterministic png filename per format", () => {
    const fileName = getDownloadFilename("pfp", new Date("2026-08-13T00:00:00.000Z"));

    assert.equal(fileName, "hh-goa-2026-pfp-20260813.png");
  });
});

describe("getNextBuilderTitle", () => {
  it("cycles through the builder titles", () => {
    assert.equal(getNextBuilderTitle(BUILDER_TITLES[0]), BUILDER_TITLES[1]);
    assert.equal(getNextBuilderTitle(BUILDER_TITLES.at(-1)!), BUILDER_TITLES[0]);
  });
});
