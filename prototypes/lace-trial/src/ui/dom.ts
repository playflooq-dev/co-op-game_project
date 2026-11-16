type Props = Partial<{
  className: string;
  text: string;
  type: string;
  placeholder: string;
  maxLength: number;
  onClick: (event: MouseEvent) => void;
  dataset: Record<string, string>;
  ariaLabel: string;
}>;

/** Tiny element builder so screens read as structure, not DOM calls. Text is always set as text, never HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  children: (Node | null)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.type) el.setAttribute('type', props.type);
  if (props.placeholder) el.setAttribute('placeholder', props.placeholder);
  if (props.maxLength) el.setAttribute('maxlength', String(props.maxLength));
  if (props.ariaLabel) el.setAttribute('aria-label', props.ariaLabel);
  if (props.onClick) el.addEventListener('click', props.onClick as EventListener);
  if (props.dataset) Object.assign(el.dataset, props.dataset);
  for (const child of children) if (child) el.append(child);
  return el;
}

export function clear(root: HTMLElement): void {
  root.replaceChildren();
}
