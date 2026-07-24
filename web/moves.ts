export function renderMoves(moveList: string[]): void {
  const movesDiv = document.getElementById("moves");
  if (movesDiv == null) {
    return;
  }

  movesDiv.innerHTML = "";

  if (moveList.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "moves-empty";
    emptyDiv.textContent = "No moves yet";
    movesDiv.appendChild(emptyDiv);
  } else {
    for (let i = 0; i < moveList.length; i += 2) {
      const moveDiv = document.createElement("div");
      moveDiv.className = "move-row";

      const numberSpan = document.createElement("span");
      numberSpan.className = "move-number";
      numberSpan.textContent = `${i / 2 + 1}.`;

      const whiteSpan = document.createElement("span");
      whiteSpan.className = "move-white";
      whiteSpan.textContent = moveList[i] ?? "";

      const blackSpan = document.createElement("span");
      blackSpan.className = "move-black";
      blackSpan.textContent = moveList[i + 1] ?? "";

      moveDiv.appendChild(numberSpan);
      moveDiv.appendChild(whiteSpan);
      moveDiv.appendChild(blackSpan);
      movesDiv.appendChild(moveDiv);
    }
  }

  movesDiv.scrollTop = movesDiv.scrollHeight;
}
