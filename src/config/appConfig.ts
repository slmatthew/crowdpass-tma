import { publicUrl } from "@/helpers/publicUrl";

export const appConfig = {
  isDevMode: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.DEV ? 'https://cps-test.slmatthew.dev/api/' : 'https://crowdpass-api.slmatthew.dev/api/',
  placeholderSrc: publicUrl('placeholder.png'),
  pageSize: 10,
};