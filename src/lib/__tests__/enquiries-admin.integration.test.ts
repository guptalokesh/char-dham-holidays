import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { listEnquiries, updateEnquiryStatus } from "@/lib/enquiries-admin";

describe("admin enquiries", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists enquiries newest first", async () => {
    const first = await prisma.enquiry.create({
      data: { name: "A", phone: "1", service: "GENERAL" },
    });
    await new Promise((r) => setTimeout(r, 5));
    const second = await prisma.enquiry.create({
      data: { name: "B", phone: "2", service: "GENERAL" },
    });

    const results = await listEnquiries();
    expect(results.map((e) => e.id)).toEqual([second.id, first.id]);
  });

  it("filters by status", async () => {
    await prisma.enquiry.create({ data: { name: "A", phone: "1", service: "GENERAL" } });
    const contacted = await prisma.enquiry.create({
      data: { name: "B", phone: "2", service: "GENERAL", status: "CONTACTED" },
    });

    const results = await listEnquiries({ status: "CONTACTED" });
    expect(results.map((e) => e.id)).toEqual([contacted.id]);
  });

  it("updates status", async () => {
    const enquiry = await prisma.enquiry.create({
      data: { name: "A", phone: "1", service: "GENERAL" },
    });

    const updated = await updateEnquiryStatus(enquiry.id, "CLOSED");
    expect(updated.status).toBe("CLOSED");
  });

  it("rejects an invalid status", async () => {
    const enquiry = await prisma.enquiry.create({
      data: { name: "A", phone: "1", service: "GENERAL" },
    });

    await expect(updateEnquiryStatus(enquiry.id, "BOGUS" as never)).rejects.toThrow();
  });
});
