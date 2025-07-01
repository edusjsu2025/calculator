#!/usr/bin/env python3
import os
import glob

# Get all HTML files
html_files = glob.glob("*.html")

# Files to skip (already updated or don't need updates)
skip_files = ['index.html', 'temperature-calculator.html', 'pressure-calculator.html', 
              'density-calculator.html', 'humidity-calculators.html', 'drying-calculators.html',
              'other-calculators.html', 'relative-humidity-calculator.html', 'moisture-calculators.html']

# AdSense code
adsense_code = '''            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2205593928173688"
                 crossorigin="anonymous"></script>
            <!-- zishiying -->
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-2205593928173688"
                 data-ad-slot="8971293106"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>'''

for filename in html_files:
    if filename in skip_files:
        continue
        
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove sign-in links
        if 'sign-in.html' in content:
            content = content.replace(
                '        <div id="login">\n            <a href="sign-in.html">sign in</a>\n        </div>',
                '        <div id="login">\n            <!-- Login removed -->\n        </div>'
            )
        
        # Replace advertisement spaces
        if '<!-- Advertisement space -->' in content:
            content = content.replace(
                '        <div style="padding-top:10px; min-height:280px; text-align:center;">\n            <!-- Advertisement space -->\n        </div>',
                f'        <div style="padding-top:10px; min-height:280px; text-align:center;">\n{adsense_code}\n        </div>'
            )
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {filename}")
        
    except Exception as e:
        print(f"Error updating {filename}: {e}")

print("Batch update completed!")
