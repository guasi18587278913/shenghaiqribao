import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel-analytics";
import { PlausibleAnalytics } from "./plausible-analytics";
import { UmamiAnalytics } from "./umami-analytics";

export function Analytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      {/* openpanel analytics */}
      <OpenPanelAnalytics />

      {/* google analytics */}
      <GoogleAnalytics />

      {/* umami analytics */}
      <UmamiAnalytics />

      {/* plausible analytics */}
      <PlausibleAnalytics />
    </>
  );
}
