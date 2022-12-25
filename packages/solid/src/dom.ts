type LimitedMouseEvent = Pick<
  MouseEvent,
  "button" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey"
>;

function isModifiedEvent(event: LimitedMouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function shouldProcessLinkClick(
  event: LimitedMouseEvent,
  target?: string
) {
  return (
    event.button === 0 && // Ignore everything but left clicks
    (!target || target === "_self") && // Let browser handle "target=_blank" etc.
    !isModifiedEvent(event) // Ignore clicks with modifier keys
  );
}
