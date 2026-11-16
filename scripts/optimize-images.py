"""Refresh the checked-in WebP variants. Run with Python and Pillow (WebP support)."""

from io import BytesIO
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "public" / "images"
DECOR = IMAGES / "decor"
WALLPAPERS = IMAGES / "wallpapers"
THUMBNAIL_INDEX = ROOT / "src" / "features" / "decor" / "decorThumbnails.json"


def encode_variant(path, bounds, quality, mode):
    with Image.open(path) as source:
        image = source.convert(mode)
    image.thumbnail(bounds, Image.Resampling.LANCZOS)
    buffer = BytesIO()
    image.save(buffer, "WEBP", quality=quality)
    content = buffer.getvalue()

    with Image.open(BytesIO(content)) as variant:
        if variant.size != image.size:
            raise ValueError(f"Unexpected WebP dimensions for {path.name}")
        if mode == "RGBA" and variant.convert("RGBA").getchannel("A").tobytes() != image.getchannel("A").tobytes():
            raise ValueError(f"WebP alpha differs from the resized original for {path.name}")
    return content, image.size


def main():
    decor_assets = sorted(DECOR.glob("*.png"))
    wallpapers = sorted(WALLPAPERS.glob("garden-*.webp"))
    if not decor_assets or not wallpapers:
        raise FileNotFoundError("Expected source decor PNGs and Garden wallpapers")

    thumbnails = {}
    output = DECOR / "thumbnails"
    output.mkdir(exist_ok=True)
    original_bytes = served_bytes = 0
    for source in decor_assets:
        original_size = source.stat().st_size
        original_bytes += original_size
        content, (width, height) = encode_variant(source, (150, 264), 86, "RGBA")
        if len(content) >= original_size:
            served_bytes += original_size
            continue
        (output / source.with_suffix(".webp").name).write_bytes(content)
        thumbnails[source.name] = {"width": width, "height": height}
        served_bytes += len(content)

    THUMBNAIL_INDEX.write_text(json.dumps(thumbnails, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Decor: {len(thumbnails)}/{len(decor_assets)} smaller WebP files. "
          f"Served catalog: {original_bytes:,} to {served_bytes:,} bytes.")

    output = WALLPAPERS / "mobile"
    output.mkdir(exist_ok=True)
    for source in wallpapers:
        content, (width, height) = encode_variant(source, (1280, 2000), 82, "RGB")
        if len(content) >= source.stat().st_size:
            raise ValueError(f"Mobile wallpaper is larger than {source.name}")
        (output / source.name).write_bytes(content)
        print(f"{source.name}: {source.stat().st_size:,} to {len(content):,} bytes ({width}×{height}).")


if __name__ == "__main__":
    main()
