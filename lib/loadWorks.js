// The ONLY place artworks are defined.
// Drop images into public/art/ (optionally describe them in public/art/info.json).
// If public/art is empty, the built-in sample photos (lib/sample.json) are used.
const fs = require("fs");
const path = require("path");
const DIR = path.join(process.cwd(), "public", "art");
const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const DEFAULT_PRICE = "0.003"; // ETH

const pretty = (f) => f.replace(EXT, "").replace(/^\d+[-_. ]*/, "").replace(/[-_]+/g, " ").trim() || f;

function loadWorks() {
  let files = [];
  try { files = fs.readdirSync(DIR).filter((f) => EXT.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); } catch (e) {}
  if (!files.length) return require("./sample.json");
  let info = {};
  try { info = JSON.parse(fs.readFileSync(path.join(DIR, "info.json"), "utf8")); } catch (e) {}
  return files.map((f, i) => {
    const m = info[f] || {};
    const url = "/art/" + encodeURIComponent(f);
    return {
      id: i + 1, // on-chain id = position in the sorted file list
      title: m.title || pretty(f),
      place: m.place || "",
      note: m.note || "",
      thumb_url: url,
      image_url: url,
      tall: !!m.tall,
      price_eth: String(m.price ?? DEFAULT_PRICE),
    };
  });
}
module.exports = { loadWorks };
