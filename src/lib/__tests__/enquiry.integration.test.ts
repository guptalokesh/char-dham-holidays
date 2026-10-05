import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { getEnquiryServiceOptions, submitGeneralEnquiry } from "@/lib/enquiry";
import { updateWebsiteSettings } from "@/lib/settings";
import { createTrek } from "@/lib/trek";

vi.mock("@/lib/email/send", () => ({
  sendMail: vi.fn().mockResolvedValue({ skipped: false }),
}));

const { sendMail } = await import("@/lib/email/send");

const valid = {
  name: "Meera Nair",
  phone: "+91 98765 43210",
  email: "meera@example.com",
  service: "GENERAL" as const,
  message: "I'd like to know more about your packages.",
};

describe("submitGeneralEnquiry", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await prisma.enquiry.deleteMany();
    await prisma.chardhamPackage.deleteMany();
    await prisma.trek.deleteMany();
    await prisma.websiteSettings.deleteMany();
    await updateWebsiteSettings({
      enquiryEmail: "organiser@chardhamholidays.example",
      primaryEmail: "primary@chardhamholidays.example",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves the enquiry and sends both a notification and acknowledgement email", async () => {
    const result = await submitGeneralEnquiry(valid);

    const enquiry = await prisma.enquiry.findUniqueOrThrow({ where: { id: result.enquiryId } });
    expect(enquiry.name).toBe("Meera Nair");
    expect(enquiry.service).toBe("GENERAL");

    expect(sendMail).toHaveBeenCalledTimes(2);
    const calls = (sendMail as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.some(([args]) => args.to === "organiser@chardhamholidays.example")).toBe(true);
    expect(calls.some(([args]) => args.to === "meera@example.com")).toBe(true);
  });

  it("falls back to primaryEmail when enquiryEmail is not set", async () => {
    await prisma.websiteSettings.deleteMany();
    await updateWebsiteSettings({ primaryEmail: "primary@chardhamholidays.example" });

    await submitGeneralEnquiry(valid);

    const calls = (sendMail as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.some(([args]) => args.to === "primary@chardhamholidays.example")).toBe(true);
  });

  it("still saves the enquiry when sending email fails", async () => {
    (sendMail as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("SMTP down"));

    const result = await submitGeneralEnquiry(valid);

    expect(await prisma.enquiry.count({ where: { id: result.enquiryId } })).toBe(1);
  });

  it("links a trekking enquiry to the selected trek", async () => {
    const trek = await createTrek({ name: "Devrana Trek", description: "d" });

    const result = await submitGeneralEnquiry({
      ...valid,
      service: "TREKKING",
      trekId: trek.id,
    });

    const enquiry = await prisma.enquiry.findUniqueOrThrow({ where: { id: result.enquiryId } });
    expect(enquiry.trekId).toBe(trek.id);
  });

  it("rejects a trekking enquiry referencing a nonexistent trek", async () => {
    await expect(
      submitGeneralEnquiry({ ...valid, service: "TREKKING", trekId: "does-not-exist" })
    ).rejects.toThrow();
  });

  it("links a Char Dham enquiry to the selected package and names it in the email", async () => {
    const pkg = await prisma.chardhamPackage.create({
      data: { slug: "any-dham", name: "Any Dham Yatra by Helicopter", order: 2 },
    });

    const result = await submitGeneralEnquiry({
      ...valid,
      service: "CHARDHAM",
      chardhamPackageId: pkg.id,
    });

    const enquiry = await prisma.enquiry.findUniqueOrThrow({ where: { id: result.enquiryId } });
    expect(enquiry.chardhamPackageId).toBe(pkg.id);
    const subjects = (sendMail as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => JSON.stringify(a));
    expect(subjects.some((s) => s.includes("Any Dham Yatra by Helicopter"))).toBe(true);
  });

  it("requires a package for a Char Dham enquiry", async () => {
    await expect(submitGeneralEnquiry({ ...valid, service: "CHARDHAM" })).rejects.toThrow();
    await expect(
      submitGeneralEnquiry({ ...valid, service: "CHARDHAM", chardhamPackageId: "nope" })
    ).rejects.toThrow();
  });

  it("rejects invalid input and saves nothing", async () => {
    await expect(submitGeneralEnquiry({ ...valid, email: "not-an-email" })).rejects.toThrow();
    expect(await prisma.enquiry.count()).toBe(0);
  });
});

describe("getEnquiryServiceOptions", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.chardhamPackage.deleteMany();
    await prisma.trek.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists each active yatra package by name instead of one fixed Char Dham entry", async () => {
    await prisma.chardhamPackage.create({ data: { slug: "char-dham", name: "Char Dham Yatra by Helicopter", order: 1 } });
    await prisma.chardhamPackage.create({ data: { slug: "any-dham", name: "Any Dham Yatra by Helicopter", order: 2 } });
    await prisma.chardhamPackage.create({ data: { slug: "off", name: "Hidden Yatra", order: 3, active: false } });

    const options = (await getEnquiryServiceOptions()).filter((o) => o.service === "CHARDHAM");

    expect(options.map((o) => o.label)).toEqual([
      "Char Dham Yatra by Helicopter",
      "Any Dham Yatra by Helicopter",
    ]);
    expect(options.every((o) => o.chardhamPackageId)).toBe(true);
  });

  it("includes the fixed services plus each active trek by name", async () => {
    await createTrek({ name: "Devrana Trek", description: "d" });
    const inactive = await createTrek({ name: "Hidden Trek", description: "d" });
    await prisma.trek.update({ where: { id: inactive.id }, data: { active: false } });

    const options = await getEnquiryServiceOptions();
    const labels = options.map((o) => o.label);

    expect(labels).toContain("Devrana Trek");
    expect(labels).toContain("Farm Home Stay");
    expect(labels).toContain("General Enquiry");
    expect(labels).not.toContain("Hidden Trek");
  });
});
