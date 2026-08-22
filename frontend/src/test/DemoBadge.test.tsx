import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { DemoBadge } from "../components/DemoBadge";

it("renders the demo badge label", () => {
  render(<DemoBadge label="Demo Data" />);
  expect(screen.getByText("Demo Data")).toBeTruthy();
});
