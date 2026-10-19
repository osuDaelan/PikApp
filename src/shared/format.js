export const fmt = n => Math.round(n).toLocaleString();
export function fmtDuration(d) {
  if (d <= 0) return "Today!";
  const days = Math.ceil(d);
  if (days < 7) return `${days}d`;
  if (days < 30) {
    const w = Math.floor(days / 7), r = days % 7;
    return r === 0 ? `${w}w` : `${w}w ${r}d`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30), r = Math.floor((days % 30) / 7);
    return r === 0 ? `${m}mo` : `${m}mo ${r}w`;
  }
  const y = Math.floor(days / 365), rem = Math.floor((days % 365) / 30);
  return rem === 0 ? `${y}yr` : `${y}yr ${rem}mo`;
}
export function fmtDate(date) { return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
export function fmtTime(date) { return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
export function tDate(days) { const d = new Date(); d.setDate(d.getDate() + days); return d; }

export function fmtComma(n) {
  return n.toLocaleString("en-US");
}

export function stripCommas(str) {
  return str.replace(/,/g, "");
}
