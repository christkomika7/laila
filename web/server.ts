import { serve } from "bun";

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    const filePath = `./dist${url.pathname === "/" ? "/index.html" : url.pathname}`;

    return new Response(Bun.file(filePath));
  },
});
