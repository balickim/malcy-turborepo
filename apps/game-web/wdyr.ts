/// <reference types="@welldone-software/why-did-you-render" />
import * as React from "react";

if (import.meta.env.DEV && import.meta.env.VITE_USE_WDYR === "true") {
  const { default: wdyr } = await import(
    "@welldone-software/why-did-you-render"
  );

  wdyr(React, {
    include: [/.*/],
    exclude: [/^Ion/, /^Link/, /^Route/, /^Redirect/],
    trackHooks: true,
    trackAllPureComponents: true,
    collapseGroups: true,
  });
}
