import { next, rewrite } from "@vercel/functions";

const HE_ORIGIN = "https://www.zohar-ai.co.il";
const INTL_ORIGIN = "https://zohar-ai.com";
const HE_HOSTS = new Set(["zohar-ai.co.il", "www.zohar-ai.co.il"]);
const INTL_HOSTS = new Set(["zohar-ai.com", "www.zohar-ai.com"]);
const INTL_LOCALE = /^\/(en|fr|es|ru|ar)(?:\/|$)/;
const ROOT_LEGAL = /^\/(privacy|accessibility|terms)(?:\/|$)/;

function stripLocale(pathname) {
  return "/" + pathname.split("/").slice(2).join("/");
}

function target(origin, pathname, search) {
  const url = new URL(origin);
  url.pathname = pathname || "/";
  url.search = search;
  return url;
}

export function routeRequest(rawUrl) {
  const incoming = new URL(rawUrl);
  const host = incoming.hostname.toLowerCase();
  const { pathname, search } = incoming;

  if (INTL_HOSTS.has(host)) {
    if (pathname === "/he" || pathname.startsWith("/he/")) {
      return { action: "redirect", url: target(HE_ORIGIN, stripLocale(pathname), search) };
    }
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      return { action: "redirect", url: target(INTL_ORIGIN, stripLocale(pathname), search) };
    }
    if (host === "www.zohar-ai.com") {
      return { action: "redirect", url: target(INTL_ORIGIN, pathname, search) };
    }
    if (pathname === "/") {
      const url = new URL(incoming);
      url.pathname = "/en/";
      return { action: "rewrite", url };
    }
    if (ROOT_LEGAL.test(pathname)) {
      const url = new URL(incoming);
      url.pathname = "/en" + pathname;
      return { action: "rewrite", url };
    }
  }

  if (HE_HOSTS.has(host)) {
    const locale = pathname.match(INTL_LOCALE)?.[1];
    if (locale) {
      const publicPath = locale === "en" ? stripLocale(pathname) : pathname;
      return { action: "redirect", url: target(INTL_ORIGIN, publicPath, search) };
    }
    if (pathname === "/he" || pathname.startsWith("/he/")) {
      return { action: "redirect", url: target(HE_ORIGIN, stripLocale(pathname), search) };
    }
    if (host === "zohar-ai.co.il") {
      return { action: "redirect", url: target(HE_ORIGIN, pathname, search) };
    }
    if (pathname === "/robots.txt") {
      const url = new URL(incoming);
      url.pathname = "/robots-he.txt";
      return { action: "rewrite", url };
    }
  }

  return { action: "next" };
}

export default function middleware(request) {
  const decision = routeRequest(request.url);
  if (decision.action === "redirect") return Response.redirect(decision.url, 308);
  if (decision.action === "rewrite") return rewrite(decision.url);
  return next();
}

export const config = {
  matcher: [
    "/",
    "/en/:path*",
    "/he/:path*",
    "/fr/:path*",
    "/es/:path*",
    "/ru/:path*",
    "/ar/:path*",
    "/privacy/:path*",
    "/accessibility/:path*",
    "/terms/:path*",
    "/robots.txt"
  ]
};
