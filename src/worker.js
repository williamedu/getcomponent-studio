// Serve "/" and "/wallsmith/" as index pages; every other file is served exactly as requested (no redirects).
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") url.pathname = "/index.html";
    else if (url.pathname === "/wallsmith/") url.pathname = "/wallsmith/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
