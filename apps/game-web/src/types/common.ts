export interface IApiResponse<T> {
  message?: string;
  statusCode: number;
  data: T;
}

export interface IJob<T> {
  id: number;
  name: string;
  data: T;
  opts: {
    attempts: number;
    delay: number;
    timestamp: number;
  };
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  stacktrace: [];
  returnvalue: number | null;
  finishedOn: number | null;
  processedOn: number;
}
