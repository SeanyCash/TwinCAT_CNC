import React from "react";
import type { MachineState } from "../types/plc";

const PACKML_LAYOUT: Record<MachineState, { x: number; y: number }> = {
  RESETTING: { x: 0, y: 0 },
  IDLE: { x: 1, y: 0 },
  STARTING: { x: 2, y: 0 },
  EXECUTE: { x: 3, y: 0 },
  HELD: { x: 3, y: 1 },
  COMPLETING: { x: 4, y: 0 },
  COMPLETE: { x: 5, y: 0 },
  STOPPING: { x: 2, y: 2 },
  STOPPED: { x: 3, y: 2 },
  ABORTING: { x: 4, y: 2 },
  ABORTED: { x: 5, y: 2 },
};

const PACKML_TRANSITIONS: Array<[MachineState, MachineState]> = [
  ["RESETTING", "IDLE"],
  ["IDLE", "STARTING"],
  ["STARTING", "EXECUTE"],
  ["EXECUTE", "HELD"],
  ["HELD", "EXECUTE"],
  ["EXECUTE", "COMPLETING"],
  ["COMPLETING", "COMPLETE"],
  ["COMPLETE", "RESETTING"],
  ["EXECUTE", "STOPPING"],
  ["HELD", "STOPPING"],
  ["IDLE", "STOPPING"],
  ["STARTING", "STOPPING"],
  ["STOPPING", "STOPPED"],
  ["STOPPED", "RESETTING"],
  ["IDLE", "ABORTING"],
  ["STARTING", "ABORTING"],
  ["EXECUTE", "ABORTING"],
  ["HELD", "ABORTING"],
  ["COMPLETING", "ABORTING"],
  ["COMPLETE", "ABORTING"],
  ["STOPPING", "ABORTING"],
  ["STOPPED", "ABORTING"],
  ["ABORTING", "ABORTED"],
  ["ABORTED", "RESETTING"],
];

const stateMeta: Record<MachineState, { label: string }> = {
  RESETTING: { label: "Resetting" },
  IDLE: { label: "Idle" },
  STARTING: { label: "Starting" },
  EXECUTE: { label: "Execute" },
  HELD: { label: "Held" },
  COMPLETING: { label: "Completing" },
  COMPLETE: { label: "Complete" },
  STOPPING: { label: "Stopping" },
  STOPPED: { label: "Stopped" },
  ABORTING: { label: "Aborting" },
  ABORTED: { label: "Aborted" },
};

const STATE_KEYS = Object.keys(PACKML_LAYOUT) as MachineState[];
const CELL_W = 180;
const CELL_H = 110;
const NODE_W = 124;
const NODE_H = 60;
const PAD = 40;

function getNodeCenter(state: MachineState) {
  const pos = PACKML_LAYOUT[state];
  return {
    x: PAD + pos.x * CELL_W + NODE_W / 2,
    y: PAD + pos.y * CELL_H + NODE_H / 2,
  };
}

function getNodeTopLeft(state: MachineState) {
  const pos = PACKML_LAYOUT[state];
  return {
    x: PAD + pos.x * CELL_W,
    y: PAD + pos.y * CELL_H,
  };
}

function isTransitionActive(from: MachineState, to: MachineState, activeState: MachineState, previousState: MachineState | null) {
  return previousState === from && activeState === to;
}

function nodeClasses(kind: "normal" | "stop" | "abort", isActive: boolean) {
  if (isActive) {
    if (kind === "abort") return "bg-red-600/20 border-red-500 text-red-200 shadow-lg";
    if (kind === "stop") return "bg-amber-500/20 border-amber-400 text-amber-100 shadow-lg";
    return "bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-lg";
  }

  if (kind === "abort") return "bg-zinc-900 border-red-900/70 text-zinc-300";
  if (kind === "stop") return "bg-zinc-900 border-amber-900/70 text-zinc-300";
  return "bg-zinc-900 border-zinc-700 text-zinc-300";
}

function getStateKind(state: MachineState): "normal" | "stop" | "abort" {
  if (state.includes("ABORT")) return "abort";
  if (state.includes("STOP")) return "stop";
  return "normal";
}

interface PackMLStateMachineDisplayProps {
  activeState?: MachineState;
  previousState?: MachineState | null;
  title?: string;
  showLegend?: boolean;
  compact?: boolean;
}

export default function PackMLStateMachineDisplay({
  activeState = "IDLE",
  previousState = null,
  title = "PackML State Machine",
  showLegend = true,
  compact = false,
}: PackMLStateMachineDisplayProps) {
  const width = PAD * 2 + 6 * CELL_W;
  const height = PAD * 2 + 3 * CELL_H;

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-white shadow-2xl">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-zinc-400">
            Current state: <span className="font-medium text-white">{activeState}</span>
            {previousState ? (
              <>
                {" "}
                · Previous: <span className="font-medium text-white">{previousState}</span>
              </>
            ) : null}
          </p>
        </div>

        {showLegend && !compact ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Active / Running Path
            </div>
            <div className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-100">
              Stop States
            </div>
            <div className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-200">
              Abort States
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[1100px]"
          role="img"
          aria-label="PackML state machine display"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-600" />
            </marker>
            <marker
              id="arrowActive"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-emerald-400" />
            </marker>
          </defs>

          {PACKML_TRANSITIONS.map(([from, to]) => {
            const start = getNodeCenter(from);
            const end = getNodeCenter(to);
            const active = isTransitionActive(from, to, activeState, previousState);

            let path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

            if (Math.abs(start.y - end.y) > 5 && Math.abs(start.x - end.x) > 5) {
              const midX = (start.x + end.x) / 2;
              path = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
            }

            return (
              <path
                key={`${from}-${to}`}
                d={path}
                fill="none"
                className={active ? "stroke-emerald-400" : "stroke-zinc-600"}
                strokeWidth={active ? 4 : 2}
                markerEnd={`url(#${active ? "arrowActive" : "arrow"})`}
                opacity={active ? 1 : 0.9}
              />
            );
          })}

          {STATE_KEYS.map((state) => {
            const pos = getNodeTopLeft(state);
            const isActive = state === activeState;
            const kind = getStateKind(state);

            return (
              <foreignObject
                key={state}
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-2xl border px-3 py-2 text-center transition-all ${nodeClasses(kind, isActive)}`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      State
                    </div>
                    <div className="truncate text-sm font-semibold">{stateMeta[state].label}</div>
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export const demoSequence = [
  "RESETTING",
  "IDLE",
  "STARTING",
  "EXECUTE",
  "HELD",
  "EXECUTE",
  "COMPLETING",
  "COMPLETE",
  "RESETTING",
  "IDLE",
  "STOPPING",
  "STOPPED",
  "RESETTING",
  "IDLE",
  "ABORTING",
  "ABORTED",
  "RESETTING",
  "IDLE",
] satisfies MachineState[];
