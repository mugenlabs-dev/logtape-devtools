import { GITHUB_ISSUES_URL, SITE_NAME } from "../content/site";
import { ContentPage } from "./content-page";

export const ContactPage = () => (
  <ContentPage description={`How to reach the maintainers of ${SITE_NAME}.`} title="Contact">
    <p>
      Open a{" "}
      <a href={GITHUB_ISSUES_URL} rel="noopener noreferrer" target="_blank">
        GitHub Issue
      </a>{" "}
      on the project repository.
    </p>
  </ContentPage>
);
