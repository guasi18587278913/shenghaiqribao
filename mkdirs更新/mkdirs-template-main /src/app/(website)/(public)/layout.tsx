import { BannerAd } from "@/components/layout/banner-ad";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { marketingConfig } from "@/config/marketing";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <div className="sticky top-0 z-50">
        <BannerAd />
        <Navbar scroll={true} config={marketingConfig} />
      </div> */}
      <Navbar scroll={true} config={marketingConfig} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
