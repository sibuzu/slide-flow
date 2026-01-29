import argparse
import os
import sys
from pdf2image import convert_from_path

def convert_pdf_to_slides(pdf_path, output_folder, dpi=200):
    """
    Convert a PDF file to a series of images.
    """
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        sys.exit(1)

    # 確保輸出目錄存在
    os.makedirs(output_folder, exist_ok=True)
    
    print(f"Converting {pdf_path} to images in {output_folder} with DPI={dpi}...")
    
    try:
        # 轉換
        images = convert_from_path(pdf_path, dpi=dpi)
        
        # 儲存為 01.png, 02.png...
        for i, image in enumerate(images):
            filename = f"{i+1:02d}.png"
            output_path = os.path.join(output_folder, filename)
            image.save(output_path, "PNG")
            print(f"Saved {output_path}")
            
        print(f"Successfully converted {len(images)} pages.")
        
    except Exception as e:
        print(f"Error during conversion: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Convert PDF to slide images.")
    parser.add_argument("input", help="Path to input PDF file")
    parser.add_argument("--output", "-o", required=True, help="Output directory for images")
    parser.add_argument("--dpi", type=int, default=200, help="DPI for rasterization (default: 200)")
    
    args = parser.parse_args()
    
    convert_pdf_to_slides(args.input, args.output, args.dpi)

if __name__ == "__main__":
    main()
