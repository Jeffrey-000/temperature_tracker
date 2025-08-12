export class FetchError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

// Specialized error types
export class NetworkError extends FetchError {
  constructor(message: string) {
    super(`Network error: ${message}`);
  }
}

export class HttpError extends FetchError {
  constructor(message: string, status: number) {
    super(`HTTP error ${status}: ${message}`, status);
  }
}

export class JsonError extends FetchError {
  constructor(message: string, status?: number) {
    super(`Invalid JSON: ${message}`, status);
  }
}

export class DataParseError extends FetchError {
  constructor(message: string) {
    super(`Data parsing error: ${message}`);
  }
}
