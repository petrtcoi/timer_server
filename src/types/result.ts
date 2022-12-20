export enum ResultType {
  Ok = "Ok",
  Error = "Error",
  Skipped = "Skipped"
}
export type Result<T> = { result: ResultType, payload: T }
export type ResultStr = Result<string>

export type JustResult = ResultType
