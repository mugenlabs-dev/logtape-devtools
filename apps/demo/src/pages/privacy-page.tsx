import { SITE_NAME } from "../content/site";
import { ContentPage } from "./content-page";

export const PrivacyPage = () => (
  <ContentPage description={`Privacy for ${SITE_NAME}.`} title="Privacy">
    <p>This documentation site does not require an account.</p>
    <p>The project adds no analytics or tracking.</p>
    <p>
      The library keeps log data in your browser or application process and sends nothing to
      Mugenlabs.
    </p>
    <p>The software is provided as-is under the MIT license.</p>
  </ContentPage>
);
