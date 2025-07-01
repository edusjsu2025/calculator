#!/usr/bin/env python3
"""
Script to ensure all calculator pages have the correct mobile scripts
"""

import os
import re
import glob

def fix_calculator_file(filepath):
    """Fix a single calculator HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if all required scripts are present
        has_mobile_opt = 'mobile-optimization.js' in content
        has_mobile_enhancer = 'calculator-mobile-enhancer.js' in content  
        has_mobile_fix = 'mobile-calculator-fix.js' in content
        
        if has_mobile_opt and has_mobile_enhancer and has_mobile_fix:
            print(f"✓ {filepath} already has all mobile scripts")
            return True
        
        # Find the last script tag before </body>
        script_pattern = r'(<script[^>]*src="js/[^"]*\.js"[^>]*></script>)\s*</body>'
        match = re.search(script_pattern, content)
        
        if match:
            last_script = match.group(1)
            
            # Build the mobile scripts section
            mobile_scripts = []
            if not has_mobile_opt:
                mobile_scripts.append('<script src="js/mobile-optimization.js"></script>')
            if not has_mobile_enhancer:
                mobile_scripts.append('<script src="js/calculator-mobile-enhancer.js"></script>')
            if not has_mobile_fix:
                mobile_scripts.append('<script src="js/mobile-calculator-fix.js"></script>')
            
            if mobile_scripts:
                # Insert mobile scripts before the last script
                mobile_scripts_str = '\n'.join(mobile_scripts)
                replacement = f"{mobile_scripts_str}\n{last_script}"
                new_content = content.replace(last_script, replacement)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ Fixed {filepath} - added {len(mobile_scripts)} scripts")
                return True
        else:
            # Try to find any script tag and add before it
            any_script_pattern = r'(<script[^>]*>.*?</script>)\s*</body>'
            match = re.search(any_script_pattern, content, re.DOTALL)
            
            if match:
                script_section = match.group(1)
                mobile_scripts = [
                    '<script src="js/mobile-optimization.js"></script>',
                    '<script src="js/calculator-mobile-enhancer.js"></script>',
                    '<script src="js/mobile-calculator-fix.js"></script>'
                ]
                mobile_scripts_str = '\n'.join(mobile_scripts)
                replacement = f"{mobile_scripts_str}\n{script_section}"
                new_content = content.replace(script_section, replacement)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ Fixed {filepath} - added all mobile scripts")
                return True
            else:
                # Add scripts before </body>
                mobile_scripts = [
                    '<script src="js/mobile-optimization.js"></script>',
                    '<script src="js/calculator-mobile-enhancer.js"></script>',
                    '<script src="js/mobile-calculator-fix.js"></script>'
                ]
                mobile_scripts_str = '\n'.join(mobile_scripts)
                new_content = content.replace('</body>', f"{mobile_scripts_str}\n</body>")
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✓ Fixed {filepath} - added scripts before </body>")
                return True
                
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    # Find all HTML files that contain calculator forms
    html_files = glob.glob("*.html")
    calculator_files = []
    
    for file in html_files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'form[name="calform"]' in content or 'name="calform"' in content:
                    calculator_files.append(file)
        except:
            continue
    
    print(f"Found {len(calculator_files)} calculator files")
    print("Fixing calculator files...")
    
    fixed_count = 0
    
    for filepath in calculator_files:
        if fix_calculator_file(filepath):
            fixed_count += 1
    
    print(f"\nCompleted: {fixed_count}/{len(calculator_files)} files fixed")

if __name__ == "__main__":
    main()
