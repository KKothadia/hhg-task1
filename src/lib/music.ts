export type Track = {
  id: string;
  playlistIndex: number;
  title: string;
  durationSeconds: number;
  thumbnail?: string;
};

export const YOUTUBE_PLAYLIST_ID = "PLFWBFgmIMIG-cJq8kpikHYMCrdkAGsDT-";
export const PLAYLIST_PAGE_SIZE = 4;

export const PLAYLIST: Track[] = Array.from({ length: PLAYLIST_PAGE_SIZE }, (_, index) => ({
  id: `playlist-track-${String(index + 1).padStart(2, "0")}`,
  playlistIndex: index,
  title: `TRACK ${String(index + 1).padStart(2, "0")}`,
  durationSeconds: 0,
}));

export function formatDigitalTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getTrackById(trackId: string, tracks: Track[] = PLAYLIST): Track {
  const list = tracks.length ? tracks : PLAYLIST;
  return list.find((track) => track.id === trackId) ?? list[0];
}

export function getTrackByPlaylistIndex(playlistIndex: number, tracks: Track[] = PLAYLIST): Track {
  const list = tracks.length ? tracks : PLAYLIST;
  return list[playlistIndex] ?? list[0];
}

export function updateTrackTitle(track: Track, title: string): Track {
  const cleanTitle = title.trim();
  if (!cleanTitle) return track;
  return {
    ...track,
    title: cleanTitle,
  };
}

export function getAdjacentTrack(
  currentId: string,
  direction: "next" | "previous",
  tracks: Track[] = PLAYLIST,
): Track {
  const list = tracks.length ? tracks : PLAYLIST;
  const currentIndex = list.findIndex((track) => track.id === currentId);
  const index = currentIndex === -1 ? 0 : currentIndex;
  const offset = direction === "next" ? 1 : -1;
  const nextIndex = (index + offset + list.length) % list.length;
  return list[nextIndex];
}

export function tracksFromVideoIds(videoIds: string[], previous: Track[] = []): Track[] {
  return videoIds.filter(Boolean).map((videoId, index) => {
    const existing = previous.find((track) => track.id === videoId);
    return {
      id: videoId,
      playlistIndex: index,
      title: existing?.title ?? `TRACK ${String(index + 1).padStart(2, "0")}`,
      durationSeconds: existing?.durationSeconds ?? 0,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    };
  });
}

export function visiblePlaylistPage(tracks: Track[], page: number): Track[] {
  const start = Math.max(0, page) * PLAYLIST_PAGE_SIZE;
  return tracks.slice(start, start + PLAYLIST_PAGE_SIZE);
}

export function playlistPageCount(totalTracks: number): number {
  return Math.max(1, Math.ceil(totalTracks / PLAYLIST_PAGE_SIZE));
}
