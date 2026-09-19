import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetNav } from "./tests/unit/next-mock";

vi.mock("next/navigation", () => import("./tests/unit/next-mock"));

afterEach(() => {
  cleanup();
  resetNav();
});
