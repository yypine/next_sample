export interface Prefecture {
  prefCode: number;
  prefName: string;
}

export interface ApiResponse<T> {
  message: string | null;
  result: T;
}
