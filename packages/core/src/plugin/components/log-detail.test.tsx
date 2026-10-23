import { renderToString } from "react-dom/server";
import { safeStringify } from "../../safe-json";
import { makeRecord } from "../__stories__/fixtures";
import { LogDetail } from "./log-detail";

vi.mock("../../safe-json", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../safe-json")>();
  return { ...actual, safeStringify: vi.fn(actual.safeStringify) };
});

describe("LogDetail", () => {
  it("builds a record's JSON once across remounts", () => {
    const record = makeRecord({ level: "info", properties: { userId: 42 } });

    const first = renderToString(<LogDetail record={record} />);
    const second = renderToString(<LogDetail record={record} />);

    expect(first).toContain("&quot;userId&quot;: 42");
    expect(second).toBe(first);
    expect(safeStringify).toHaveBeenCalledTimes(1);
  });
});
