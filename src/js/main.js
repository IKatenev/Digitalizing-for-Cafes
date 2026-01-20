import "../scss/main.scss";
import fontRegular from "../assets/fonts/tthoves-regular.woff2?url";
import fontMedium from "../assets/fonts/tthoves-medium.woff2?url";

[fontRegular, fontMedium].forEach((href) => {
  const l = document.createElement("link");
  l.rel = "preload";
  l.as = "font";
  l.href = href;
  l.type = "font/woff2";
  l.crossOrigin = "anonymous";
  document.head.appendChild(l);
});
