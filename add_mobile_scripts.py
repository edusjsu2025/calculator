#!/usr/bin/env python3
"""
Script to add mobile optimization scripts to all calculator HTML pages
"""

import os
import re
import glob

def add_mobile_scripts_to_file(filepath):
    """Add mobile optimization scripts to a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if mobile scripts are already added
        if 'mobile-optimization.js' in content:
            print(f"✓ {filepath} already has mobile scripts")
            return True
        
        # Find the script tag before </body>
        script_patterns = [
            r'<script src="js/([^"]+)\.js"></script>\s*</body>',
            r'<script src="js/([^"]+)\.js"></script>\s*\n\s*</body>',
        ]
        
        for pattern in script_patterns:
            match = re.search(pattern, content)
            if match:
                original_script = match.group(0)
                script_name = match.group(1)
                
                # Create new script block with mobile optimization
                new_scripts = f'''<script src="js/mobile-optimization.js"></script>
<script src="js/calculator-mobile-enhancer.js"></script>
<script src="js/{script_name}.js"></script>
</body>'''
                
                # Replace the original script
                new_content = content.replace(original_script, new_scripts)
                
                # Write back to file
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✓ Updated {filepath}")
                return True
        
        print(f"✗ Could not find script pattern in {filepath}")
        return False
        
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all calculator HTML files"""
    
    # List of calculator HTML files to update
    calculator_files = [
        'absolute-humidity-calculator.html',
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
        'psychrometric-calculator.html',
        'soil-moisture-calculator.html',
        'vapor-pressure-calculator.html',
        'volume-calculator.html',
        'wet-basis-calculator.html',
        'wet-bulb-calculator.html',
        'wood-moisture-calculator.html'
    ]
    
    print("🚀 Adding mobile optimization scripts to calculator pages...")
    print("=" * 60)
    
    updated_count = 0
    total_count = 0
    
    for filename in calculator_files:
        if os.path.exists(filename):
            total_count += 1
            if add_mobile_scripts_to_file(filename):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {filename}")
    
    print("=" * 60)
    print(f"📊 Summary: {updated_count}/{total_count} files updated successfully")
    
    if updated_count > 0:
        print("\n✅ Mobile optimization scripts added to calculator pages!")
        print("\n📱 Features added:")
        print("   • Auto-scroll to results after calculation")
        print("   • Loading states and visual feedback")
        print("   • Touch-optimized form inputs")
        print("   • Mobile-friendly validation")
        print("   • Haptic feedback (where supported)")
        print("   • Keyboard optimization")
        print("   • Double-tap to select inputs")
        
        print("\n🎯 Next steps:")
        print("   1. Test on mobile devices")
        print("   2. Verify scroll-to-results functionality")
        print("   3. Check form validation feedback")
        print("   4. Test touch interactions")
    
    return updated_count == total_count

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
