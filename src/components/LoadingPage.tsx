import { FC } from "react";
import { Page } from "./Page";
import { Spinner } from "@telegram-apps/telegram-ui";

export const LoadingPage: FC = () => (
  <Page>
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}>
      <Spinner size='m' />
    </div>
  </Page>
);