#!/usr/bin/env python3
"""
Script to apply mobile fixes to all calculator HTML pages
"""

import os
import re
import glob

def apply_mobile_fix_to_file(filepath):
    """Apply mobile fix script to a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if mobile-calculator-fix.js is already added
        if 'mobile-calculator-fix.js' in content:
            print(f"✓ {filepath} already has mobile fix script")
            return True
        
        # Find the mobile-optimization.js script tag and add mobile-calculator-fix.js after it
        pattern = r'(<script src="js/mobile-optimization\.js"></script>\s*\n\s*<script src="js/calculator-mobile-enhancer\.js"></script>)'
        replacement = r'\1\n    <script src="js/mobile-calculator-fix.js"></script>'
        
        new_content = re.sub(pattern, replacement, content)
        
        # If the above pattern doesn't match, try a simpler pattern
        if new_content == content:
            pattern = r'(<script src="js/calculator-mobile-enhancer\.js"></script>)'
            replacement = r'\1\n    <script src="js/mobile-calculator-fix.js"></script>'
            new_content = re.sub(pattern, replacement, content)
        
        # If still no match, add before the main calculator script
        if new_content == content:
            # Look for any calculator-specific script
            calculator_scripts = [
                'moisture-calculator.js',
                'humidity-calculator.js', 
                'drying-calculator.js',
                'temperature-calculator.js',
                'wood-calculator.js',
                'grain-calculator.js'
            ]
            
            for script in calculator_scripts:
                pattern = f'(<script src="js/{script}"></script>)'
                replacement = f'<script src="js/mobile-calculator-fix.js"></script>\n    \\1'
                new_content = re.sub(pattern, replacement, content)
                if new_content != content:
                    break
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Updated {filepath}")
            return True
        else:
            print(f"⚠ Could not find insertion point in {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    # List of calculator HTML files to update
    calculator_files = [
        'absolute-humidity-calculator.html',
        'air-drying-calculator.html', 
        'concrete-moisture-calculator.html',
        'density-calculator.html',
        'dew-point-calculator.html',
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
        'pressure-calculator.html',
        'psychrometric-calculator.html',
        'relative-humidity-calculator.html',
        'soil-moisture-calculator.html',
        'temperature-calculator.html',
        'vapor-pressure-calculator.html',
        'volume-calculator.html',
        'wet-basis-calculator.html',
        'wet-bulb-calculator.html',
        'wood-moisture-calculator.html'
    ]
    
    print("Applying mobile fixes to calculator pages...")
    
    updated_count = 0
    total_count = 0
    
    for filename in calculator_files:
        if os.path.exists(filename):
            total_count += 1
            if apply_mobile_fix_to_file(filename):
                updated_count += 1
        else:
            print(f"⚠ File not found: {filename}")
    
    print(f"\nCompleted: {updated_count}/{total_count} files updated")

if __name__ == "__main__":
    main()
