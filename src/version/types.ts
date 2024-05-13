export type VersionSuccessResponse = {
  status: "success";
  data: {
    version: string;
    build_time_utc: string;
  };
};
