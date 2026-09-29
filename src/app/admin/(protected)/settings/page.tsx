import { getWebsiteSettings } from "@/lib/settings";
import { SettingsAdminForm } from "@/components/admin/SettingsAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getWebsiteSettings();

  return (
    <div>
      <h1 className="text-xl font-semibold">Website / Business Settings</h1>
      <div className="mt-6">
        <SettingsAdminForm initial={settings} />
      </div>
    </div>
  );
}
