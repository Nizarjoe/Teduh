type Fields = Record<string, string | number | boolean | null>;

function write(level: "info" | "warn" | "error", msg: string, fields?: Fields): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, fields?: Fields) => write("info", msg, fields),
  warn: (msg: string, fields?: Fields) => write("warn", msg, fields),
  error: (msg: string, fields?: Fields) => write("error", msg, fields),
};

export function maskPhone(phone: string): string {
  if (phone.length < 7) return "***";
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}
