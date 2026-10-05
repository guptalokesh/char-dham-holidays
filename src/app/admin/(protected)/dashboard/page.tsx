import Link from "next/link";
import { listPackages } from "@/lib/packages";
import { listTreks } from "@/lib/trek";
import { listRooms } from "@/lib/farm";
import { listEnquiries } from "@/lib/enquiries-admin";
import { formatInr, formatPriceOrRequest } from "@/lib/format";

export const dynamic = "force-dynamic";

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [yatras, treks, rooms, allEnquiries] = await Promise.all([
    listPackages({ activeOnly: false }),
    listTreks({ activeOnly: false }),
    listRooms(),
    listEnquiries(),
  ]);

  const activeListingsCount =
    yatras.filter((y) => y.active).length + treks.filter((t) => t.active).length;
  const pendingEnquiries = allEnquiries.filter((e) => e.status === "NEW");
  const itineraryCount =
    yatras.filter((y) => y.itineraryMediaId).length + treks.filter((t) => t.itineraryMediaId).length;
  const recentEnquiries = allEnquiries.slice(0, 10);

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Active listings" value={activeListingsCount} />
        <SummaryCard label="New enquiries" value={pendingEnquiries.length} />
        <SummaryCard label="Home Stay rooms" value={rooms.length} />
        <SummaryCard label="Itinerary PDFs" value={itineraryCount} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Listing status</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {yatras.map((yatra) => (
                <tr key={yatra.id}>
                  <td className="px-4 py-2">{yatra.name}</td>
                  <td className="px-4 py-2">{formatPriceOrRequest(yatra.price)}</td>
                  <td className="px-4 py-2">{yatra.active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {treks.map((trek) => (
                <tr key={trek.id}>
                  <td className="px-4 py-2">{trek.name}</td>
                  <td className="px-4 py-2">
                    {trek.price ? formatInr(trek.price) : "Customised"}
                  </td>
                  <td className="px-4 py-2">{trek.active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-4 py-2">{room.name} (Farm Home Stay)</td>
                  <td className="px-4 py-2">{formatInr(room.price)}</td>
                  <td className="px-4 py-2">{room.active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent enquiries</h2>
          <Link href="/admin/availability-enquiries" className="text-sm text-blue-700 underline">
            View all
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Received</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-500" colSpan={6}>
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td className="px-4 py-2">{enquiry.name}</td>
                    <td className="px-4 py-2">{enquiry.phone}</td>
                    <td className="px-4 py-2">
                      {enquiry.trek?.name ?? enquiry.service.replace("_", " ")}
                    </td>
                    <td className="max-w-xs truncate px-4 py-2">{enquiry.message ?? "—"}</td>
                    <td className="px-4 py-2">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{enquiry.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
