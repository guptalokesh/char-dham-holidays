import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhotoCredits } from "@/components/yatra/PhotoCredits";

describe("PhotoCredits", () => {
  it("names the author and licence of each credited photo and links to its source", () => {
    render(<PhotoCredits urls={["/seed-images/dham-badrinath.jpg", "/seed-images/hotel-exterior.jpg"]} />);

    expect(screen.getByText(/photo credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Vishwanath Negi/)).toBeInTheDocument();
    expect(screen.getByText(/CC BY 4\.0/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /badrinath temple/i })).toHaveAttribute(
      "href",
      expect.stringContaining("commons.wikimedia.org")
    );
  });

  it("renders nothing when no photo needs a credit", () => {
    const { container } = render(<PhotoCredits urls={["/seed-images/hotel-exterior.jpg"]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
