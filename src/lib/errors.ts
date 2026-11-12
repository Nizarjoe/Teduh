export class AppError extends Error {
  readonly fields?: Record<string, string>;

  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
    this.fields = fields;
  }
}
