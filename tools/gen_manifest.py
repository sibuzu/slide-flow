import os
import json
import argparse

def generate_manifest(sliders_dir, output_file):
    """
    Scan sliders directory and generate manifest.json
    """
    if not os.path.exists(sliders_dir):
        print(f"Error: Sliders directory not found at {sliders_dir}")
        return

    manifest = []
    
    # List directories in sliders_dir
    try:
        items = sorted(os.listdir(sliders_dir))
    except Exception as e:
        print(f"Error listing directory: {e}")
        return

    for item in items:
        item_path = os.path.join(sliders_dir, item)
        
        if os.path.isdir(item_path):
            config_path = os.path.join(item_path, "config.json")
            
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                    
                    # Validate required fields
                    if 'title' not in config:
                        print(f"Warning: Missing 'title' in {config_path}, skipping.")
                        continue
                        
                    # Build entry
                    entry = {
                        "id": item,
                        "path": f"/sliders/{item}", # Web path
                        "title": config.get("title", item),
                        "orient": config.get("orient", "landscape"), # Default landscape
                        "subgroup": config.get("subgroup", False),
                        "chapters": config.get("chapters", [])
                    }
                    
                    # Check for cover image
                    cover_candidates = ["cover.png", "cover.jpg", "cover.jpeg"]
                    entry["cover"] = ""
                    for cand in cover_candidates:
                        if os.path.exists(os.path.join(item_path, cand)):
                            entry["cover"] = f"/sliders/{item}/{cand}"
                            break
                            
                    # Scan for slides
                    image_extensions = {".png", ".jpg", ".jpeg", ".webp"}
                    
                    def get_images(path):
                        imgs = []
                        if os.path.exists(path):
                            for f in sorted(os.listdir(path)):
                                if any(f.lower().endswith(ext) for ext in image_extensions):
                                    if "cover" not in f.lower():
                                        imgs.append(f)
                        return sorted(imgs)

                    if entry["subgroup"]:
                        # For subgroups, we expect chapters to be defined or we scan subdirs?
                        # Spec says config has chapters list. We should fill them with slides if possible?
                        # Or just assume the paths in chapters are valid relative paths.
                        # We will inject 'slides' into each chapter entry if chapters exist.
                        new_chapters = []
                        for chap in entry.get("chapters", []):
                            chap_rel_path = chap.get("path", "")
                            # If path is relative to item_path
                            full_chap_path = os.path.join(item_path, chap_rel_path)
                            chap_images = get_images(full_chap_path)
                            chap["slides"] = [f"/sliders/{item}/{chap_rel_path}/{img}".replace("//", "/") for img in chap_images]
                            new_chapters.append(chap)
                        entry["chapters"] = new_chapters
                    else:
                        # Flat structure
                        imgs = get_images(item_path)
                        entry["slides"] = [f"/sliders/{item}/{img}" for img in imgs]
                            
                    manifest.append(entry)
                    print(f"Added slide group: {entry['title']} ({item}) with {len(entry.get('slides', [])) if not entry['subgroup'] else 'subgroups'} slides")
                    
                except json.JSONDecodeError:
                    print(f"Error: Invalid JSON in {config_path}")
                except Exception as e:
                    print(f"Error processing {item}: {e}")
            else:
                # Optionally warn about missing config
                # print(f"Skipping {item}: No config.json found")
                pass

    # Write manifest
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        print(f"Manifest generated at {output_file} with {len(manifest)} items.")
    except Exception as e:
        print(f"Error result writing manifest: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate manifest.json for SlideFlow.")
    parser.add_argument("--sliders", default="public/sliders", help="Directory containing slide groups (default: public/sliders)")
    parser.add_argument("--output", default="public/sliders/manifest.json", help="Output manifest file (default: public/sliders/manifest.json)")
    
    args = parser.parse_args()
    
    generate_manifest(args.sliders, args.output)

if __name__ == "__main__":
    main()
