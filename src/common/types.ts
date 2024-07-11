export type ErrorResponse = {
  status: "error";
  errorCode: string;
  errorMessage?: string;
  errorUserMessage?: string;
};
