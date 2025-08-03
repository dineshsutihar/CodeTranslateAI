import esbuild from "esbuild";
import "dotenv/config";

const define = {};
for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

esbuild
  .build({
    entryPoints: ["scripts/content.js", "background.js"],
    bundle: true,
    outdir: "dist",
    define: define,
  })
  .catch(() => process.exit(1));

console.log("Build complete. Files are in the /dist folder.");
