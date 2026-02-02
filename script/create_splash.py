#!/usr/bin/env python3
from PIL import Image
import os

bg_color = (10, 10, 15, 255)
size = 2732
img = Image.new('RGBA', (size, size), bg_color)

logo_path = '/Users/m1/Desktop/mining-club/client/public/attached_assets/App-Logo.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert('RGBA')
    logo_size = int(size * 0.10)
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    img.paste(logo, (x, y), logo)
    print('Added logo at %d, %d with size %dx%d' % (x, y, logo.width, logo.height))

splash_dir = '/Users/m1/Desktop/mining-club/ios/App/App/Assets.xcassets/Splash.imageset'
for suffix in ['@1x~universal~anyany', '@2x~universal~anyany', '@3x~universal~anyany', '@1x~universal~anyany-dark', '@2x~universal~anyany-dark', '@3x~universal~anyany-dark']:
    output_path = os.path.join(splash_dir, 'Default' + suffix + '.png')
    img.save(output_path, 'PNG')
    print('Saved: ' + output_path)

print('Done!')
