import { useEffect, useCallback } from "react";

interface KeyboardShortcutActions {
  onNewTodo: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSearch: () => void;
  onToggleComplete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEscape: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || (el as HTMLElement).isContentEditable;
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        actions.onEscape();
        return;
      }
      if (isInputFocused()) return;
      switch (e.key) {
        case "n": case "N": e.preventDefault(); actions.onNewTodo(); break;
        case "d": case "D": e.preventDefault(); actions.onDelete(); break;
        case "e": case "E": e.preventDefault(); actions.onEdit(); break;
        case "/": e.preventDefault(); actions.onSearch(); break;
        case " ": e.preventDefault(); actions.onToggleComplete(); break;
        case "ArrowUp": case "k": e.preventDefault(); actions.onMoveUp(); break;
        case "ArrowDown": case "j": e.preventDefault(); actions.onMoveDown(); break;
      }
    },
    [actions]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
