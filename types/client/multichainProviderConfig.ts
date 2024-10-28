export type MultichainProviderConfig = {
  name: string;
  dapp_id?: string;
  url_template: string;
  logo: string;
};

export type MultichainProviderConfigResult = {
  name: string;
  logoUrl: string;
  urlTemplate: string;
  dappId?: string;
};
