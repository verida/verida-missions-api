export type UserProfileInfo = {
  name: string;
  country: string;
};

export type ValidRequestParams = {
  did: string;
  walletAddress: string;
  profile: UserProfileInfo;
};
