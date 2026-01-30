import argparse
import os
import sys
import json
from pdf2image import convert_from_path

def convert_pdf_to_slides(pdf_path, output_folder, dpi=200):
    """
    Convert a PDF file to a series of images (WebP) and generate config.
    """
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return False

    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    
    # Check if already converted
    config_path = os.path.join(output_folder, "config.json")
    cover_path = os.path.join(output_folder, "cover.webp")
    
    if os.path.exists(config_path) and os.path.exists(cover_path):
        print(f"Skipping {pdf_path}: Already converted (found config.json and cover.webp)")
        return True

    # 確保輸出目錄存在
    os.makedirs(output_folder, exist_ok=True)
    
    print(f"Converting {pdf_path} to images in {output_folder} with DPI={dpi}...")
    
    try:
        # Convert to PIL images (default ppm)
        # We process them manually to ensure quality/size control
        images = convert_from_path(pdf_path, dpi=dpi)
        
        if not images:
            print(f"Error: No images extracted from {pdf_path}")
            return False

        def process_and_save(image, output_path):
            # Resize if width > 1920
            if image.width > 1920:
                ratio = 1920 / image.width
                new_height = int(image.height * ratio)
                image = image.resize((1920, new_height), resample=3) # 3 is PIL.Image.LANCZOS/ANTIALIAS

            # Save as WebP with specific settings
            image.save(output_path, "WEBP", quality=75, method=6)
            print(f"Saved {output_path}")

        # Save cover (first page)
        process_and_save(images[0], cover_path)

        # Save all pages
        for i, image in enumerate(images):
            # Format: {pdf_name}-001.webp
            filename = f"{pdf_name}-{i+1:03d}.webp"
            output_path = os.path.join(output_folder, filename)
            process_and_save(image, output_path)
            
        # Generate config.json
        config_data = {
            "title": pdf_name,
            "orient": "landscape"
        }
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=4, ensure_ascii=False)
        print(f"Generated config: {config_path}")

        print(f"Successfully converted {len(images)} pages.")
        return True
        
    except Exception as e:
        print(f"Error during conversion of {pdf_path}: {e}")
        return False

def scan_and_convert(public_dir, dpi=200):
    if not os.path.exists(public_dir):
        print(f"Error: Public directory not found at {public_dir}")
        sys.exit(1)

    print(f"Scanning for PDF files in {public_dir}...")
    pdf_count = 0

    for root, dirs, files in os.walk(public_dir):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_count += 1
                pdf_path = os.path.join(root, file)
                pdf_name = os.path.splitext(file)[0]
                
                # Output folder is in the SAME directory as the PDF
                output_folder = os.path.join(root, pdf_name)
                
                convert_pdf_to_slides(pdf_path, output_folder, dpi)

    if pdf_count == 0:
        print(f"No PDF files found in {public_dir}")
    else:
        print(f"Processed {pdf_count} PDF(s).")

def main():
    parser = argparse.ArgumentParser(description="Convert PDFs in public directory to slide folders.")
    parser.add_argument("--dir", default="public", help="Public directory path (default: public)")
    parser.add_argument("--dpi", type=int, default=200, help="DPI for rasterization (default: 200)")
    
    args = parser.parse_args()
    
    # Resolve absolute path for verify
    public_path = os.path.abspath(args.dir)
    scan_and_convert(public_path, args.dpi)

if __name__ == "__main__":
    main()
