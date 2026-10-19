# Image sources

## Complete existing decor catalog

All 896 current checklist entries now have local PNG artwork, retrieved October 18, 2026 from the actual file references in [Pikipedia's regular gallery](https://www.pikminwiki.com/Decor_Pikmin#Gallery) and [special decor sections](https://www.pikminwiki.com/Special_Decor_Pikmin). Rare entries are included in this full rollout. The following pilot sections preserve the original rollout history.

The complete per-image inventory is [docs/decor-image-sources.json](../../docs/decor-image-sources.json): collection ID, local filename, original file URL, source page/gallery, dimensions, byte size, checksum, and representative-design flag. Some existing checklist entries group multiple designs; their images are explicitly marked as representatives. All assets preserve the original PNG transparency. These are existing game images, not AI-generated. Pikmin artwork belongs to Nintendo; attribution does not grant a redistribution license.

## Decor image pilot: Red Chef Hat

- Local file: `decor/restaurant-chef-hat-red.png` (153 × 361 PNG, original transparency preserved).
- Existing collection ID: `restaurant__chef_hat__Red`.
- Source page: https://www.pikminwiki.com/File:Decor_Red_Chef_Hat.png
- Catalogue: https://www.pikminwiki.com/Decor_Pikmin
- Original file: https://pikmin.wiki.gallery/images/a/a7/Decor_Red_Chef_Hat.png
- Retrieved October 18, 2026. Existing game artwork archived by Pikipedia, not AI-generated. Pikmin artwork belongs to Nintendo; attribution does not grant a redistribution license.

## Standard Chef Hat expansion

Retrieved October 18, 2026 from Pikipedia's original image files. Existing game artwork, not AI-generated; original transparency preserved. Rare variants are excluded. Local files are in `decor/`.

| Color | Local file | Dimensions | Source page / original PNG |
| --- | --- | --- | --- |
| Yellow | `restaurant-chef-hat-yellow.png` | 129 × 377 | [Source](https://www.pikminwiki.com/File:Decor_Yellow_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/3/33/Decor_Yellow_Chef_Hat.png) |
| Blue | `restaurant-chef-hat-blue.png` | 120 × 294 | [Source](https://www.pikminwiki.com/File:Decor_Blue_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/e/ef/Decor_Blue_Chef_Hat.png) |
| Purple | `restaurant-chef-hat-purple.png` | 147 × 429 | [Source](https://www.pikminwiki.com/File:Decor_Purple_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/6/66/Decor_Purple_Chef_Hat.png) |
| White | `restaurant-chef-hat-white.png` | 134 × 299 | [Source](https://www.pikminwiki.com/File:Decor_White_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/9/93/Decor_White_Chef_Hat.png) |
| Rock | `restaurant-chef-hat-rock.png` | 218 × 420 | [Source](https://www.pikminwiki.com/File:Decor_Rock_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/7/79/Decor_Rock_Chef_Hat.png) |
| Winged | `restaurant-chef-hat-winged.png` | 132 × 313 | [Source](https://www.pikminwiki.com/File:Decor_Winged_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/7/74/Decor_Winged_Chef_Hat.png) |
| Ice | `restaurant-chef-hat-ice.png` | 153 × 416 | [Source](https://www.pikminwiki.com/File:Decor_Ice_Chef_Hat.png), [PNG](https://pikmin.wiki.gallery/images/5/58/Decor_Ice_Chef_Hat.png) |

Pikmin artwork belongs to Nintendo; attribution does not grant a redistribution license.

## Pikmin Bloom app icon

- File: `pikmin-bloom-icon.jpg`
- Source: official [Pikmin Bloom App Store listing](https://apps.apple.com/us/app/id1556357398), retrieved October 18, 2026 through Apple's public lookup API.
- Original image: https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/13/7a/0c/137a0c65-99bc-768f-28e7-d64b9017a3eb/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg
- Official artwork used for identification in this fan companion. All rights remain with their respective owners; this attribution does not grant a redistribution license or imply affiliation.

## Official Garden wallpapers

Retrieved October 18, 2026. These are existing Nintendo/game assets, not AI-generated artwork.

### Nintendo Pikmin Garden

Source: [Nintendo's official Pikmin Garden](https://www.nintendo.com/jp/character/pikmin/index.html), referenced by its public `assets/css/top.css` stylesheet. These are tall, high-resolution website scenes, cropped with CSS to fill the screen.

| Local file in `wallpapers/` | Original asset |
| --- | --- |
| `garden-day.webp` | https://www.nintendo.com/jp/character/pikmin/assets/img/top/bg_body01.webp?imbypass=true |
| `garden-evening.webp` | https://www.nintendo.com/jp/character/pikmin/assets/img/top/bg_body01_evening.webp?imbypass=true |
| `garden-night.webp` | https://www.nintendo.com/jp/character/pikmin/assets/img/top/bg_body01_night.webp?imbypass=true |

All rights remain with their respective owners. Source attribution does not grant a redistribution license. The three Garden images are the only wallpaper assets used on all screen sizes. Previously tested Bloom loading-screen images have been removed.
