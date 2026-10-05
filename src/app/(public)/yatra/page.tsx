import type { Metadata } from "next";
import { listPackages } from "@/lib/packages";
import { YatraHubContent } from "@/components/yatra/YatraHubContent";

// Admin-editable content must always reflect the latest database state.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Helicopter Yatra | Char Dham Holidays",
  description:
    "Visit Yamunotri, Gangotri, Kedarnath and Badrinath by helicopter: the full Char Dham yatra, any dham of your choice, and Yamunotri and Gangotri helicopter handling.",
  alternates: { canonical: "/yatra" },
};

export default async function YatraHubPage() {
  const yatras = await listPackages();
  return <YatraHubContent yatras={yatras} />;
}
