import { getRoomAvailabilityGrid } from "@/lib/farm";
import { listEnquiries } from "@/lib/enquiries-admin";
import { RoomAvailabilityGrid } from "@/components/admin/RoomAvailabilityGrid";
import { EnquiriesTable } from "@/components/admin/EnquiriesTable";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityEnquiriesPage() {
  const [grid, enquiries] = await Promise.all([
    getRoomAvailabilityGrid(14),
    listEnquiries(),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold">Farm Home Stay — Room Availability</h1>
        <div className="mt-4">
          <RoomAvailabilityGrid initial={grid} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Enquiries</h2>
        <div className="mt-4">
          <EnquiriesTable enquiries={enquiries} />
        </div>
      </section>
    </div>
  );
}
