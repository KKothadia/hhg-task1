"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Repeat, SkipBack, SkipForward, X } from "lucide-react";
import {
  PLAYLIST,
  YOUTUBE_PLAYLIST_ID,
  type Track,
  formatDigitalTime,
  getAdjacentTrack,
  getTrackById,
  getTrackByPlaylistIndex,
  playlistPageCount,
  tracksFromVideoIds,
  updateTrackTitle,
  visiblePlaylistPage,
} from "@/lib/music";

type PlayerState = {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  loop: boolean;
  volume: number;
  playTrack: (trackId: string) => void;
  togglePlayback: () => void;
  toggleLoop: () => void;
  skip: (direction: "next" | "previous") => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
};

type PlaylistConfig = { list: string; listType: "playlist"; index?: number; startSeconds?: number };

type YouTubePlayer = {
  cuePlaylist: (config: PlaylistConfig) => void;
  loadPlaylist: (config: PlaylistConfig) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  playVideoAt: (index: number) => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setLoop: (loopPlaylists: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlaylist: () => string[] | undefined;
  getPlaylistIndex: () => number;
  getVideoData: () => { title?: string; video_id?: string };
};

type YouTubeConstructor = new (
  elementId: string,
  config: {
    height: string;
    width: string;
    videoId?: string;
    playerVars: Record<string, number | string>;
    events: {
      onReady: (event: { target: YouTubePlayer }) => void;
      onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
      onError?: (event: { data: number; target: YouTubePlayer }) => void;
    };
  },
) => YouTubePlayer;

declare global {
  interface Window {
    YT?: {
      Player: YouTubeConstructor;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYLIST_CONFIG: PlaylistConfig = {
  list: YOUTUBE_PLAYLIST_ID,
  listType: "playlist",
  index: 0,
};

const MusicContext = createContext<PlayerState | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>(PLAYLIST);
  const [currentTrack, setCurrentTrack] = useState<Track>(PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(PLAYLIST[0].durationSeconds);
  const [loop, setLoop] = useState(true);
  const [volume, setVolumeState] = useState(72);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const pendingTrackRef = useRef<Track | null>(null);
  const tracksRef = useRef(tracks);
  const loopRef = useRef(loop);
  const volumeRef = useRef(volume);
  const readyRef = useRef(false);
  const retriedPlaylistRef = useRef(false);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    loopRef.current = loop;
    playerRef.current?.setLoop(loop);
  }, [loop]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const syncFromPlayer = useCallback((player: YouTubePlayer) => {
    const videoIds = player.getPlaylist?.() ?? [];
    if (videoIds.length) {
      setTracks((previous) => {
        const next = tracksFromVideoIds(videoIds, previous);
        if (previous.length === next.length && previous.every((track, index) => track.id === next[index].id)) {
          return previous;
        }
        return next;
      });
    }

    const playlistIndex = player.getPlaylistIndex();
    if (playlistIndex < 0) return;

    const liveTracks = videoIds.length ? tracksFromVideoIds(videoIds, tracksRef.current) : tracksRef.current;
    const baseTrack = getTrackByPlaylistIndex(playlistIndex, liveTracks);
    const reportedTitle = player.getVideoData()?.title ?? "";
    const nextTrack = updateTrackTitle(baseTrack, reportedTitle);

    pendingTrackRef.current = nextTrack;
    setCurrentTrack((existingTrack) => {
      if (existingTrack.id === nextTrack.id && existingTrack.title === nextTrack.title) {
        return existingTrack;
      }
      return nextTrack;
    });
    setDuration(player.getDuration() || nextTrack.durationSeconds);
  }, []);

  const startPlaylist = useCallback((index: number, autoplay: boolean) => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;

    const config = { ...PLAYLIST_CONFIG, index };
    if (autoplay) {
      player.loadPlaylist(config);
      return;
    }

    player.cuePlaylist(config);
  }, []);

  useEffect(() => {
    const mountPlayer = () => {
      if (!window.YT?.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player("hh-goa-youtube-player", {
        height: "180",
        width: "320",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          list: YOUTUBE_PLAYLIST_ID,
          listType: "playlist",
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            readyRef.current = true;
            event.target.unMute();
            event.target.setVolume(volumeRef.current);
            event.target.setLoop(true);
            startPlaylist(0, true);
            event.target.playVideo();
            setIsPlaying(true);
            syncFromPlayer(event.target);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === 1);
            syncFromPlayer(event.target);
          },
          onError: (event) => {
            if (!readyRef.current || retriedPlaylistRef.current) return;
            retriedPlaylistRef.current = true;
            event.target.loadPlaylist(PLAYLIST_CONFIG);
          },
        },
      });
    };

    if (window.YT?.Player) {
      mountPlayer();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      mountPlayer();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [startPlaylist, syncFromPlayer]);

  useEffect(() => {
    const unlockPlayback = () => {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;
      player.unMute();
      player.setVolume(volumeRef.current);
      player.playVideo();
      setIsPlaying(true);
    };

    window.addEventListener("pointerdown", unlockPlayback, { once: true, capture: true });
    window.addEventListener("keydown", unlockPlayback, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlockPlayback, true);
      window.removeEventListener("keydown", unlockPlayback, true);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;

      setElapsed(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || pendingTrackRef.current?.durationSeconds || currentTrack.durationSeconds);
      syncFromPlayer(player);
    }, 800);

    return () => window.clearInterval(timer);
  }, [currentTrack.durationSeconds, syncFromPlayer]);

  const playTrack = useCallback(
    (trackId: string) => {
      const track = getTrackById(trackId, tracksRef.current);
      pendingTrackRef.current = track;
      setCurrentTrack(track);
      setElapsed(0);
      setDuration(track.durationSeconds);
      setIsPlaying(true);

      const player = playerRef.current;
      if (!player || !readyRef.current) return;

      const loaded = player.getPlaylist?.() ?? [];
      if (!loaded.length) {
        startPlaylist(track.playlistIndex, true);
        return;
      }

      player.playVideoAt(track.playlistIndex);
    },
    [startPlaylist],
  );

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (isPlaying) {
      player?.pauseVideo();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    if (!player || !readyRef.current) return;

    const loaded = player.getPlaylist?.() ?? [];
    if (!loaded.length) {
      startPlaylist(currentTrack.playlistIndex, true);
      return;
    }

    player.playVideo();
  }, [currentTrack.playlistIndex, isPlaying, startPlaylist]);

  const toggleLoop = useCallback(() => {
    setLoop((current) => {
      const next = !current;
      playerRef.current?.setLoop(next);
      return next;
    });
  }, []);

  const skip = useCallback(
    (direction: "next" | "previous") => {
      const track = getAdjacentTrack(currentTrack.id, direction, tracksRef.current);
      pendingTrackRef.current = track;
      setCurrentTrack(track);
      setElapsed(0);
      setIsPlaying(true);

      const player = playerRef.current;
      if (!player || !readyRef.current) return;

      const loaded = player.getPlaylist?.() ?? [];
      if (!loaded.length) {
        startPlaylist(track.playlistIndex, true);
        return;
      }

      player.playVideoAt(track.playlistIndex);
    },
    [currentTrack.id, startPlaylist],
  );

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setElapsed(seconds);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.min(100, Math.max(0, Math.round(nextVolume)));
    setVolumeState(safeVolume);
    playerRef.current?.setVolume(safeVolume);
  }, []);

  const value = useMemo(
    () => ({
      tracks,
      currentTrack,
      isPlaying,
      elapsed,
      duration,
      loop,
      volume,
      playTrack,
      togglePlayback,
      toggleLoop,
      skip,
      seek,
      setVolume,
    }),
    [currentTrack, duration, elapsed, isPlaying, loop, playTrack, seek, setVolume, skip, toggleLoop, togglePlayback, tracks, volume],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <div className="yt-embed-host" aria-hidden="true">
        <div id="hh-goa-youtube-player" />
      </div>
      <PersistentMiniPlayer />
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  }
  return context;
}

export function PersistentMiniPlayer() {
  const { currentTrack, duration, elapsed, isPlaying, loop, seek, skip, toggleLoop, togglePlayback } =
    useMusicPlayer();
  const [dismissed, setDismissed] = useState(false);
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  useEffect(() => {
    setDismissed(sessionStorage.getItem("hh-goa-mini-player-dismissed") === "true");
  }, []);

  const close = () => {
    sessionStorage.setItem("hh-goa-mini-player-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Persistent mini music player"
      className="mini-player fixed bottom-[calc(env(safe-area-inset-bottom)+104px)] right-4 z-50 h-[154px] w-[min(304px,calc(100vw-32px))] border-4 border-[#FF5A1F] bg-[#0B6839] p-3 text-white md:bottom-5 md:right-5"
    >
      <span className="mini-screw left-2 top-2" />
      <span className="mini-screw right-2 top-2" />
      <span className="mini-screw bottom-2 left-2" />
      <span className="mini-screw bottom-2 right-2" />

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8A6B5C]">
          HH RADIO / TP-26
        </p>
        <button
          aria-label="Dismiss mini player"
          className="mini-icon-button h-5 w-5"
          type="button"
          onClick={close}
        >
          <X aria-hidden="true" size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-2">
        <span className={`mini-led-dot shrink-0 ${isPlaying ? "led-dot-playing" : ""}`} />
        <p className="min-w-0 flex-1 truncate whitespace-nowrap text-xs font-black uppercase tracking-[0.14em]">
          {currentTrack.title}
        </p>
      </div>

      <label className="mini-seek mt-4 block" style={{ "--progress": `${progress}%` } as React.CSSProperties}>
        <span className="sr-only">Seek track</span>
        <input
          aria-label="Seek track"
          max={Math.max(1, duration)}
          min={0}
          step={1}
          type="range"
          value={Math.min(elapsed, duration)}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <span className="mini-seek-fill" style={{ width: `${progress}%` }} />
      </label>

      <div className="mt-4 flex items-center justify-between">
        <MiniIconButton active={loop} label="Toggle loop" onClick={toggleLoop}>
          <Repeat aria-hidden="true" size={17} strokeWidth={2.4} />
        </MiniIconButton>
        <MiniIconButton label="Previous track" onClick={() => skip("previous")}>
          <SkipBack aria-hidden="true" size={17} strokeWidth={2.4} />
        </MiniIconButton>
        <MiniIconButton label={isPlaying ? "Pause track" : "Play track"} primary onClick={togglePlayback}>
          {isPlaying ? (
            <Pause aria-hidden="true" size={19} fill="currentColor" strokeWidth={2.4} />
          ) : (
            <Play aria-hidden="true" size={19} fill="currentColor" strokeWidth={2.4} />
          )}
        </MiniIconButton>
        <MiniIconButton label="Next track" onClick={() => skip("next")}>
          <SkipForward aria-hidden="true" size={17} strokeWidth={2.4} />
        </MiniIconButton>
      </div>
    </aside>
  );
}

function MiniIconButton({
  active = false,
  children,
  label,
  onClick,
  primary = false,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={`mini-icon-button ${primary ? "h-11 w-11 bg-[#FF5A1F] text-white" : "h-9 w-9 bg-[#0B6839]"} ${
        active ? "text-[#FF5A1F]" : "text-white"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function InlineMusicPlayer() {
  return (
    <div className="poster-panel mx-auto max-w-5xl bg-[#0B6839] p-4 text-white md:p-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <HardwarePlayer />
        <TrackList />
      </div>
    </div>
  );
}

function HardwarePlayer() {
  const { currentTrack, duration, elapsed, isPlaying, seek, setVolume, skip, togglePlayback, volume } =
    useMusicPlayer();
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <section
      aria-label="HH Goa music player"
      className="hardware-player relative w-full border-4 border-[#FF5A1F] bg-[#0B6839] p-3 text-white"
    >
      <div className="pointer-events-none absolute left-2 top-2 h-2 w-2 border border-[#FF5A1F] bg-[#0B6839]" />
      <div className="pointer-events-none absolute right-2 top-2 h-2 w-2 border border-[#FF5A1F] bg-[#0B6839]" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border border-[#FF5A1F] bg-[#0B6839]" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border border-[#FF5A1F] bg-[#0B6839]" />

      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.26em]">
        <span>HH RADIO / TP-26</span>
        <div className="flex items-center gap-2">
          <span className={`led-dot ${isPlaying ? "led-dot-playing" : ""}`} />
        </div>
      </div>

      <div className="lcd-display border-4 border-[#FF5A1F] bg-[#0B6839] p-3 text-white">
        <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
          {currentTrack.title}
        </p>
        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
          <div className="waveform" style={{ "--progress": `${progress}%` } as React.CSSProperties}>
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={`wave-${index}`} style={{ height: `${18 + ((index * 11) % 30)}px` }} />
            ))}
          </div>
          <p className="lcd-time text-right text-lg font-black">
            {formatDigitalTime(elapsed)} / {formatDigitalTime(duration)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <PlayerButton label="Previous track" onClick={() => skip("previous")}>
          <SkipBack aria-hidden="true" size={18} strokeWidth={2.4} />
        </PlayerButton>
        <PlayerButton label={isPlaying ? "Pause track" : "Play track"} primary onClick={togglePlayback}>
          {isPlaying ? (
            <Pause aria-hidden="true" size={20} fill="currentColor" strokeWidth={2.4} />
          ) : (
            <Play aria-hidden="true" size={20} fill="currentColor" strokeWidth={2.4} />
          )}
        </PlayerButton>
        <PlayerButton label="Next track" onClick={() => skip("next")}>
          <SkipForward aria-hidden="true" size={18} strokeWidth={2.4} />
        </PlayerButton>
        <button
          aria-label="Volume dial"
          className="dial relative ml-auto grid h-12 w-12 shrink-0 place-items-center border-4 border-[#FF5A1F] bg-[#0B6839]"
          type="button"
          onClick={() => setVolume(volume >= 90 ? 45 : volume + 15)}
        >
          <span
            className="h-5 w-1 origin-bottom bg-[#FF5A1F]"
            style={{ transform: `rotate(${volume * 2.4 - 120}deg)` }}
          />
        </button>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em]">
          Seek / Volume {volume}
        </span>
        <input
          aria-label="Seek track"
          className="zoom-slider w-full"
          max={Math.max(1, duration)}
          min={0}
          step={1}
          type="range"
          value={Math.min(elapsed, duration)}
          onChange={(event) => seek(Number(event.target.value))}
        />
      </label>
    </section>
  );
}

function PlayerButton({
  children,
  label,
  onClick,
  primary = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={`hardware-button grid h-12 w-12 shrink-0 place-items-center border-4 border-[#FF5A1F] ${
        primary ? "bg-[#FF5A1F] text-white" : "bg-[#0B6839] text-white"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TrackList() {
  const { currentTrack, isPlaying, playTrack, tracks } = useMusicPlayer();
  const [page, setPage] = useState(0);
  const pages = playlistPageCount(tracks.length);
  const safePage = Math.min(page, pages - 1);
  const visibleTracks = visiblePlaylistPage(tracks, safePage);

  return (
    <div>
      <div className="border-y-4 border-[#FF5A1F]">
        {visibleTracks.map((track) => {
          const active = track.id === currentTrack.id;
          const title = active ? currentTrack.title : track.title;
          return (
            <button
              className={`grid w-full grid-cols-[42px_54px_1fr_auto] items-center gap-3 border-b-4 border-[#FF5A1F] py-3 text-left last:border-b-0 hover:bg-[#FF5A1F] ${
                active ? "bg-[#FF5A1F] text-white" : "bg-[#0B6839] text-white"
              }`}
              key={track.id}
              type="button"
              onClick={() => playTrack(track.id)}
            >
              <span className="text-2xl font-black leading-none">
                {String(track.playlistIndex + 1).padStart(2, "0")}
              </span>
              <span
                className="block aspect-square border-4 border-[#FF5A1F] bg-cover bg-center"
                style={
                  track.thumbnail
                    ? { backgroundImage: `url(${track.thumbnail})` }
                    : {
                        backgroundImage:
                          "linear-gradient(135deg, #0B6839 0 48%, #FF5A1F 48% 58%, #ffffff 58% 100%)",
                      }
                }
              />
              <span>
                <span className="block text-sm font-black uppercase tracking-[0.12em]">{title}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em]">
                  {active && isPlaying ? "REEL ACTIVE" : "TAPE QUEUED"}
                </span>
              </span>
              <span className={`reel ${active && isPlaying ? "reel-spinning" : ""}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em]">
          Page {safePage + 1} / {pages}
        </p>
        <div className="flex gap-2">
          <button
            className="hardware-button border-4 border-[#FF5A1F] bg-[#0B6839] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-35"
            disabled={safePage <= 0}
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Prev
          </button>
          <button
            className="hardware-button border-4 border-[#FF5A1F] bg-[#FF5A1F] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-35"
            disabled={safePage >= pages - 1}
            type="button"
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
