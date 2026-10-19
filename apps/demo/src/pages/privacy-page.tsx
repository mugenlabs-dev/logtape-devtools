import { SITE_NAME } from "../content/site";
import { ContentPage } from "./content-page";

export const PrivacyPage = () => (
  <ContentPage description={`Privacy for ${SITE_NAME}.`} title="Privacy">
    <p>This documentation site does not require an account.</p>
    <p>
      On logtape-devtools.mugenlabs.dev only, the site uses PostHog (EU) to record page views, when
      you leave a page, and errors in the site itself (message and stack trace). It sets no cookies
      and keeps no identifier between visits, does not record clicks or sessions, and honours Do Not
      Track. Requests go through this site to PostHog’s EU servers, which see your IP address.
    </p>
    <p>
      The npm library keeps log data in your browser or application process and sends nothing to
      Mugenlabs.
    </p>
    <p>The software is provided as-is under the MIT license.</p>
  </ContentPage>
);
