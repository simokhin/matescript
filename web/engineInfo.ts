import { MATE_SCORE } from "../src/search/search";

export function formatEval(score: number, depth: number): string {
  if (Math.abs(score) >= MATE_SCORE) {
    const pliesToMate = depth - (Math.abs(score) - MATE_SCORE);
    const mateValue = score > 0 ? pliesToMate : -pliesToMate;
    return mateValue >= 0 ? `M${mateValue}` : `-M${Math.abs(mateValue)}`;
  }

  const pawns = score / 100;
  return `${pawns >= 0 ? "+" : ""}${pawns.toFixed(2)}`;
}

export function renderEngineInfo(
  depth: number,
  nodes: number,
  score: number,
): void {
  const engineInfoDiv = document.getElementById("engine-info");
  if (engineInfoDiv == null) {
    return;
  }

  engineInfoDiv.innerHTML = "";

  const rows: [string, string][] = [
    ["Depth", String(depth)],
    ["Nodes", nodes.toLocaleString()],
    ["Eval", formatEval(score, depth)],
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");

    const labelSpan = document.createElement("span");
    labelSpan.className = "engine-info__label";
    labelSpan.textContent = label;

    const valueSpan = document.createElement("span");
    valueSpan.className = "engine-info__value";
    valueSpan.textContent = value;

    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    engineInfoDiv.appendChild(row);
  });
}
