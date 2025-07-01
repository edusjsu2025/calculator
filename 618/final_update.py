#!/usr/bin/env python3
import os
import re

# List of all HTML files to update
html_files = [
    'air-drying-calculator.html',
    'concrete-moisture-calculator.html',
    'dry-basis-calculator.html',
    'drying-time-calculator.html',
    'energy-efficiency-calculator.html',
    'enthalpy-calculator.html',
    'equilibrium-moisture-calculator.html',
    'evaporation-rate-calculator.html',
    'grain-moisture-calculator.html',
    'heat-requirement-calculator.html',
    'kiln-drying-calculator.html',
    'mixing-ratio-calculator.html',
    'moisture-removal-calculator.html',
    'privacy.html',
    'psychrometric-calculator.html',
    'sitemap.html',
    'soil-moisture-calculator.html',
    'terms.html',
    'test-calculator.html',
    'vapor-pressure-calculator.html',
    'volume-calculator.html',
    'wet-basis-calculator.html',
    'wet-bulb-calculator.html',
    'wood-moisture-calculator.html',
    'about-us.html'
]

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

def update_file(filename):
    if not os.path.exists(filename):
        print(f"File {filename} not found, skipping...")
        return
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove sign-in links
        content = re.sub(
            r'<div id="login">\s*<a href="sign-in\.html">sign in</a>\s*</div>',
            '<div id="login">\n            <!-- Login removed -->\n        </div>',
            content,
            flags=re.MULTILINE
        )
        
        # Replace advertisement spaces with AdSense code
        content = re.sub(
            r'<div style="padding-top:10px; min-height:280px; text-align:center;">\s*<!-- Advertisement space -->\s*</div>',
            f'<div style="padding-top:10px; min-height:280px; text-align:center;">\n{adsense_code}\n        </div>',
            content,
            flags=re.MULTILINE
        )
        
        # Only write if content changed
        if content != original_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated {filename}")
        else:
            print(f"⏭️  No changes needed for {filename}")
        
    except Exception as e:
        print(f"❌ Error updating {filename}: {e}")

# Update all files
print("🚀 Starting batch update...")
for filename in html_files:
    update_file(filename)

print("\n✅ Batch update completed!")
print("\n📊 Summary:")
print("- Removed all sign-in links")
print("- Replaced advertisement spaces with AdSense code")
print("- AdSense Publisher ID: ca-pub-2205593928173688")
print("- AdSense Slot ID: 8971293106")
