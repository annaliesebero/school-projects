import { useEffect, useRef, useState } from "react";

export default function StudyTrack({ totalTimeSec, timeLeft, isRunning }) {
  const LAP_DURATION = 30; // seconds per lap

  const clampedTotal = Math.max(1, totalTimeSec || 1);
  const clampedLeft = Math.max(0, Math.min(timeLeft, clampedTotal));

  // Smooth elapsed time derived from timeLeft
  const [smoothElapsed, setSmoothElapsed] = useState(clampedTotal - clampedLeft);

  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const lastTimeLeftRef = useRef(clampedLeft);

  // Reset when session is reset
  useEffect(() => {
    if (!isRunning && clampedLeft === clampedTotal) {
      setSmoothElapsed(0);
      lastTimeLeftRef.current = clampedTotal;
    }
  }, [isRunning, clampedLeft, clampedTotal]);

  // Snap to end when finished
  useEffect(() => {
    if (clampedLeft === 0) {
      setSmoothElapsed(clampedTotal);
    }
  }, [clampedLeft, clampedTotal]);

  // Sync smoothElapsed when timeLeft changes (every second from the parent timer)
  useEffect(() => {
    const actualElapsed = clampedTotal - clampedLeft;
    
    // When the parent timer ticks, reset our smooth counter to match
    if (lastTimeLeftRef.current !== clampedLeft) {
      setSmoothElapsed(actualElapsed);
      lastTimeLeftRef.current = clampedLeft;
    }
  }, [clampedLeft, clampedTotal]);

  // rAF loop to smoothly increment elapsed time between the 1-second ticks
  useEffect(() => {
    if (!isRunning || clampedLeft === 0) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now) => {
      const dt = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      setSmoothElapsed((prev) => {
        // Don't let smooth elapsed go beyond what the actual timer says
        const maxElapsed = clampedTotal - clampedLeft + 0.999; // Allow up to next tick
        return Math.min(prev + dt, maxElapsed);
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, clampedLeft, clampedTotal]);

  // ---- Derived values ----
  const elapsed = smoothElapsed;
  const sessionProgress = elapsed / clampedTotal;

  const totalLaps = Math.max(1, Math.round(clampedTotal / LAP_DURATION));
  const lapsCompleted = Math.floor(elapsed / LAP_DURATION);
  const currentLap = Math.min(lapsCompleted + 1, totalLaps);

  // Smooth 0..1 within the current lap
  const lapTime = elapsed % LAP_DURATION;
  const lapProgress = Math.min(1, Math.max(0, lapTime / LAP_DURATION));

  return (
    <div className="w-100 d-flex flex-column gap-3" style={{ maxWidth: "500px" }}>
      {/* Session + lap info */}
      <div>
        <div className="small mb-1" style={{ color: "var(--color-text-muted)" }}>
          Session progress
        </div>
        <div className="rounded-pill overflow-hidden" style={{
            height: "8px",
            background: "var(--color-background-alt)"
          }}>
          <div
            style={{
              width: `${Math.min(1, Math.max(0, sessionProgress)) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #10b981, #34d399, var(--color-success))",
            }}
          />
        </div>

        <div className="mt-2 d-flex justify-content-between small" style={{ color: "var(--color-text-muted)" }}>
          <span>
            Lap {currentLap} / {totalLaps}
          </span>
          <span>{Math.max(0, lapsCompleted)} completed</span>
        </div>

        <div className="mt-2">
          <div className="small mb-1" style={{ color: "var(--color-text-muted)" }}>
            Current lap
          </div>
          <div className="rounded-pill overflow-hidden" style={{
              height: "6px",
              background: "var(--color-background-alt)"
            }}>
            <div
              style={{
                width: `${lapProgress * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00a2ff, #33b5ff)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Oval track */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center pt-2">
        <OvalTrack
          lapProgress={lapProgress}
          currentLap={currentLap}
          totalLaps={totalLaps}
        />
      </div>
    </div>
  );
}

function OvalTrack({ lapProgress, currentLap, totalLaps }) {
  // Easy to adjust dimensions - change these values!
  const TRACK_CONFIG = {
    width: 250,        // Track width
    height: 400,       // Track height
    x: 20,             // X position
    y: 40,             // Y position
    strokeWidth: 18,   // Base track thickness
    trailWidth: 6,     // Trail stroke width
    dotRadius: 7,     // Dot size
    trailLength: 0.12, // Trail length as fraction of track (0-1)
  };

  // Calculate viewBox and derived values
  const viewBoxWidth = TRACK_CONFIG.x * 2 + TRACK_CONFIG.width;
  const viewBoxHeight = TRACK_CONFIG.y * 2 + TRACK_CONFIG.height;
  const rx = TRACK_CONFIG.width / 6;
  const ry = TRACK_CONFIG.height / 6;

  const trackRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [dotPos, setDotPos] = useState({ 
    x: TRACK_CONFIG.x + TRACK_CONFIG.width / 2, 
    y: TRACK_CONFIG.y 
  });

  useEffect(() => {
    if (trackRef.current) {
      const len = trackRef.current.getTotalLength();
      setPathLength(len);
    }
  }, []);

  const safeProgress = Math.min(1, Math.max(0, lapProgress));

  useEffect(() => {
    if (!trackRef.current || pathLength === 0 || !isFinite(safeProgress)) return;
    const lengthAtProgress = pathLength * safeProgress;
    if (!isFinite(lengthAtProgress)) return;
    const point = trackRef.current.getPointAtLength(lengthAtProgress);
    setDotPos({ x: point.x, y: point.y });
  }, [safeProgress, pathLength]);

  // Trail length in path units
  const maxTrailLength = pathLength * TRACK_CONFIG.trailLength;
  
  // Current position on track
  const currentLength = pathLength * safeProgress;
  
  // Trail grows from 0 to maxTrailLength, then stays at maxTrailLength
  const actualTrailLength = Math.min(currentLength, maxTrailLength);
  
  // Trail always ends at dot position, starts actualTrailLength behind it
  const trailStart = currentLength - actualTrailLength;
  
  // For dasharray: draw from trailStart to currentLength
  // dasharray format: [length of dash, length of gap]
  // We want: gap of trailStart, then dash of actualTrailLength, then gap for rest
  const dasharray = pathLength > 0 
    ? `0 ${trailStart} ${actualTrailLength} ${pathLength}` 
    : "0 1";

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      style={{
        width: "100%",
        maxWidth: "340px",
        height: "100%",
        maxHeight: "520px",
      }}
    >
      {/* Base track */}
      <rect
        x={TRACK_CONFIG.x}
        y={TRACK_CONFIG.y}
        width={TRACK_CONFIG.width}
        height={TRACK_CONFIG.height}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="var(--color-background-alt)"
        strokeWidth={TRACK_CONFIG.strokeWidth}
      />

      {/* Hidden path for measurements */}
      <rect
        ref={trackRef}
        x={TRACK_CONFIG.x}
        y={TRACK_CONFIG.y}
        width={TRACK_CONFIG.width}
        height={TRACK_CONFIG.height}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
      />

      {/* Trail (appears behind dot) */}
      {pathLength > 0 && (
        <rect
          x={TRACK_CONFIG.x}
          y={TRACK_CONFIG.y}
          width={TRACK_CONFIG.width}
          height={TRACK_CONFIG.height}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={TRACK_CONFIG.trailWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
          style={{
            filter: "drop-shadow(0 0 10px var(--color-primary))",
          }}
        />
      )}

      {/* Subtle outline */}
      <rect
        x={TRACK_CONFIG.x}
        y={TRACK_CONFIG.y}
        width={TRACK_CONFIG.width}
        height={TRACK_CONFIG.height}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="var(--color-background-alt)"
        strokeWidth="2"
      />

      {/* Dot (on top of trail) */}
      <circle
        cx={dotPos.x}
        cy={dotPos.y}
        r={TRACK_CONFIG.dotRadius}
        fill="var(--color-text-muted)"
        stroke="var(--color-primary)"
        strokeWidth="3"
        style={{
          filter: "drop-shadow(0 0 8px var(--color-primary)) drop-shadow(0 0 14px var(--color-primary))",
        }}
      />

      {/* Lap text */}
      <text
        x={viewBoxWidth / 2}
        y={viewBoxHeight / 2 + 10}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize="12"
      >
        Lap {currentLap} / {totalLaps}
      </text>
    </svg>
  );
}