import { Placeholder, PlaceholderProps } from "@telegram-apps/telegram-ui";
import { FC } from "react";
import { Page } from "./Page";
import { TgsLoader } from "./TgsLoader";

export type DuckedErrorProps = PlaceholderProps & {
  pageBack?: boolean;
  tgsUrl: string;
};

export const DuckedError: FC<DuckedErrorProps> = ({ pageBack = true, tgsUrl, ...props }) => (
  <Page back={pageBack}>
    <Placeholder {...props}>
      <TgsLoader tgsUrl={tgsUrl} style={{ maxWidth: '12rem', maxHeight: '12rem', aspectRatio: '1 / 1' }} />
    </Placeholder>
  </Page>
);