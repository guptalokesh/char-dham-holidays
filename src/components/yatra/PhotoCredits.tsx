import { creditsForUrls } from "@/lib/photo-credits";

export function PhotoCredits({
  urls,
}: {
  urls: (string | null | undefined)[];
}) {
  const credits = creditsForUrls(urls);
  if (credits.length === 0) return null;

  return (
    <p className="text-xs leading-relaxed text-stone-500">
      Photo credits:{" "}
      {credits.map((credit, index) => (
        <span key={credit.sourceUrl}>
          {index > 0 && "; "}
          <a
            href={credit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {credit.subject}
          </a>{" "}
          by {credit.author}
          {" ("}
          {credit.licenseUrl ? (
            <a
              href={credit.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {credit.license}
            </a>
          ) : (
            credit.license
          )}
          {credit.note ? `, ${credit.note}` : ""}
          {", via Wikimedia Commons)"}
        </span>
      ))}
    </p>
  );
}
