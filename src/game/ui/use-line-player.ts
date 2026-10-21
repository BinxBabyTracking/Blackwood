"use client";

import { useEffect, useState } from "react";
import { LineSequence, type LineState } from "./audio-bus";

/** Sequential line playback with a stable API. Stops when the component unmounts. */
export function useLinePlayer(volume: number) {
  const [state, setState] = useState<LineState>({ current: null, status: "idle", error: null });
  const [seq] = useState(() => new LineSequence(setState));
  useEffect(() => {
    seq.setVolume(volume);
  }, [seq, volume]);
  useEffect(() => () => seq.stop(), [seq]);
  return { ...state, play: seq.play, pause: seq.pause, resume: seq.resume, stop: seq.stop };
}
