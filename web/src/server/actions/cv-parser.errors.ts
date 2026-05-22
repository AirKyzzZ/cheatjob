export class CVParseError extends Error {
  constructor() {
    super("CV could not be parsed");
    this.name = "CVParseError";
  }
}
