import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PLAYLIST,
  PLAYLIST_PAGE_SIZE,
  YOUTUBE_PLAYLIST_ID,
  formatDigitalTime,
  getAdjacentTrack,
  getTrackById,
  getTrackByPlaylistIndex,
  playlistPageCount,
  tracksFromVideoIds,
  updateTrackTitle,
  visiblePlaylistPage,
} from "./music";

describe("formatDigitalTime", () => {
  it("formats seconds as lcd-style minute timestamps", () => {
    assert.equal(formatDigitalTime(0), "0:00");
    assert.equal(formatDigitalTime(65.9), "1:05");
  });

  it("clamps negative values to zero", () => {
    assert.equal(formatDigitalTime(-12), "0:00");
  });
});

describe("track helpers", () => {
  it("uses the real HH Goa playlist id", () => {
    assert.equal(YOUTUBE_PLAYLIST_ID, "PLFWBFgmIMIG-cJq8kpikHYMCrdkAGsDT-");
  });

  it("starts with generic playlist rows instead of old placeholder copy", () => {
    assert.equal(PLAYLIST[0].title, "TRACK 01");
    assert.equal(PLAYLIST.some((track) => track.title.includes("HH Goa Signal Test")), false);
  });

  it("falls back to the first track for unknown ids", () => {
    assert.equal(getTrackById("missing").id, PLAYLIST[0].id);
  });

  it("finds tracks by playlist index", () => {
    assert.equal(getTrackByPlaylistIndex(2).id, PLAYLIST[2].id);
    assert.equal(getTrackByPlaylistIndex(999).id, PLAYLIST[0].id);
  });

  it("wraps adjacent track navigation", () => {
    assert.equal(getAdjacentTrack(PLAYLIST.at(-1)!.id, "next").id, PLAYLIST[0].id);
    assert.equal(getAdjacentTrack(PLAYLIST[0].id, "previous").id, PLAYLIST.at(-1)!.id);
  });

  it("updates generic rows with reported player titles", () => {
    assert.equal(updateTrackTitle(PLAYLIST[0], "  Real Track  ").title, "Real Track");
    assert.equal(updateTrackTitle(PLAYLIST[0], " ").title, PLAYLIST[0].title);
  });

  it("builds live playlist rows from YouTube video ids", () => {
    const tracks = tracksFromVideoIds(["abc", "def"], [
      { id: "abc", playlistIndex: 0, title: "Kept Title", durationSeconds: 12 },
    ]);

    assert.equal(tracks.length, 2);
    assert.equal(tracks[0].title, "Kept Title");
    assert.equal(tracks[1].title, "TRACK 02");
    assert.equal(tracks[1].thumbnail?.includes("def"), true);
  });

  it("pages the playlist four tracks at a time", () => {
    const tracks = tracksFromVideoIds(["a", "b", "c", "d", "e", "f"]);
    assert.equal(tracks.length, 6);
    assert.equal(visiblePlaylistPage(tracks, 0).length, PLAYLIST_PAGE_SIZE);
    assert.equal(visiblePlaylistPage(tracks, 1).map((track) => track.id).join(","), "e,f");
    assert.equal(playlistPageCount(6), 2);
  });
});
