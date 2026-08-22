export class AppError extends Error {
  statusCode: number;
  fields?: Record<string, string>;

  constructor(statusCode: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
  }
}
