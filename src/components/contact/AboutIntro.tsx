export function AboutIntro({
  businessName,
  shortDescription,
}: {
  businessName: string;
  shortDescription: string | null;
}) {
  return (
    <section id="about" aria-labelledby="about-heading" className="mt-6 scroll-mt-24">
      <h2 id="about-heading" className="text-xl font-semibold text-stone-900">
        About {businessName}
      </h2>
      {shortDescription && <p className="mt-3 text-lg text-stone-700">{shortDescription}</p>}
      <div className="mt-4 space-y-4 text-stone-700">
        <p>
          {businessName} helps pilgrims and travellers experience Uttarakhand: helicopter yatras to
          the Char Dham, customised Himalayan treks and a peaceful Farm Stay.
        </p>
        <p>
          Use this website to learn about our services, check availability and get in touch. Before
          any booking is final, our team confirms availability, itinerary details and payment
          instructions with you directly, usually over WhatsApp.
        </p>
      </div>
    </section>
  );
}
