// happy-dom global registration for bun tests that need a browser DOM
// (e.g. src/motion DOM splitting). Node-oriented suites are unaffected.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof document === "undefined") {
  GlobalRegistrator.register();
}
