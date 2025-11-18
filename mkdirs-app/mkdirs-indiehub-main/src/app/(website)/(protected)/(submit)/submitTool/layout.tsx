import { DashboardSubmitHeader } from "@/components/dashboard/dashboard-submit-header";
import { SubmitStepper } from "@/components/submit/submit-stepper";

export default async function SubmitLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardSubmitHeader
        title="Submit Tool"
        subtitle="Enter tool details"
        label=""
      >
        {/* <SubmitStepper initialStep={1} /> */}
      </DashboardSubmitHeader>

      <div className="mt-8">{children}</div>
    </div>
  );
}
