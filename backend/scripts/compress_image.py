#!/usr/bin/env python3
"""图片压缩工具：为原图生成缩略图和 WebP 压缩版本
用法: python3 compress_image.py <input_path> <output_dir>
输出: JSON { thumb: "xxx.thumb.jpg", webp: "xxx.webp", thumb_w, thumb_h, webp_w, webp_h }
"""
import sys, os, json
from PIL import Image

def main():
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    basename = os.path.splitext(os.path.basename(input_path))[0]

    try:
        im = Image.open(input_path)
        im = im.convert('RGB') if im.mode in ('RGBA', 'P') else im
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return

    # 缩略图: max 400x400, JPEG quality 85
    thumb_path = os.path.join(output_dir, basename + '.thumb.jpg')
    thumb = im.copy()
    thumb.thumbnail((400, 400), Image.LANCZOS)
    thumb.save(thumb_path, 'JPEG', quality=85, optimize=True)

    # WebP: max 1200 width, quality 80
    webp_path = os.path.join(output_dir, basename + '.webp')
    webp = im.copy()
    if webp.width > 1200:
        ratio = 1200 / webp.width
        webp = webp.resize((1200, int(webp.height * ratio)), Image.LANCZOS)
    webp.save(webp_path, 'WEBP', quality=80, method=6)

    result = {
        'thumb': os.path.basename(thumb_path),
        'webp': os.path.basename(webp_path),
        'thumb_w': thumb.width,
        'thumb_h': thumb.height,
        'webp_w': webp.width,
        'webp_h': webp.height,
    }
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
