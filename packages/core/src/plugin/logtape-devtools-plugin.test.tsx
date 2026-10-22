import { renderToString } from "react-dom/server";
import { createLogStore } from "../store";
import { makeRecord } from "./__stories__/fixtures";
import { LogTapeDevtoolsPlugin } from "./logtape-devtools-plugin";

describe("LogTapeDevtoolsPlugin", () => {
  it("renders no records on the server", () => {
    // The store is process-wide on a server, so it can hold other requests' logs.
    const store = createLogStore();
    store.addRecord(makeRecord({ level: "info", messageText: "server-only-secret" }));

    const html = renderToString(<LogTapeDevtoolsPlugin store={store} />);

    expect(html).not.toContain("server-only-secret");
    expect(html).toContain("No logs yet");
  });
});
