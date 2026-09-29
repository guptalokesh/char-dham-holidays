import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";

interface EnquiryRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  message: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  createdAt: string | Date;
  trek: { name: string } | null;
  room: { name: string } | null;
}

export function EnquiriesTable({ enquiries }: { enquiries: EnquiryRow[] }) {
  if (enquiries.length === 0) {
    return <p className="text-zinc-500">No enquiries yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Service</th>
            <th className="px-4 py-2">Message</th>
            <th className="px-4 py-2">Received</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id}>
              <td className="px-4 py-2">{enquiry.name}</td>
              <td className="px-4 py-2">{enquiry.phone}</td>
              <td className="px-4 py-2">{enquiry.email ?? "—"}</td>
              <td className="px-4 py-2">
                {enquiry.trek?.name ?? enquiry.room?.name ?? enquiry.service.replace("_", " ")}
              </td>
              <td className="max-w-xs truncate px-4 py-2">{enquiry.message ?? "—"}</td>
              <td className="px-4 py-2">{new Date(enquiry.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2">
                <EnquiryStatusSelect enquiryId={enquiry.id} status={enquiry.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
