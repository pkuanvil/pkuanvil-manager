// @ts-check
"use client";

import AssertClient from "@/utility/client/AssertClient";

function readCookiesAsJson() {
  AssertClient();
  const cookies = document.cookie.split("; ");
  const cookiesJson = {};

  cookies.forEach(cookie => {
    const [key, value] = cookie.split("=");
    cookiesJson[key] = decodeURIComponent(value);
  });

  return cookiesJson;
}

/**
 * Writes data to session Cookie.
 * @param {Object} data 
 */
function writeCookiesFromJson(data) {
  AssertClient();
  Object.entries(data).forEach(([key, value]) => {
    // Omit `expires` or `max-age` makes Cookie expire at browser session end
    document.cookie = `${key}=${encodeURIComponent(value)};SameSite=Lax`;
  })
}

export {
  readCookiesAsJson,
  writeCookiesFromJson,
}
