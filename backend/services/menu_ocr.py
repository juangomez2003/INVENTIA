"""
OCR service — extrae platos de imagen o PDF usando Tesseract.
"""
import re
import logging
import tempfile
import os
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Rutas en Windows
TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH  = r"C:\Users\juan\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"


def _get_images_from_file(file_bytes: bytes, content_type: str):
    """Convierte archivo (imagen o PDF) a lista de PIL Images."""
    from PIL import Image
    import io

    if content_type == "application/pdf":
        from pdf2image import convert_from_bytes
        return convert_from_bytes(file_bytes, dpi=200, poppler_path=POPPLER_PATH)

    # imagen directa
    return [Image.open(io.BytesIO(file_bytes))]


def _preprocess_image(img):
    """Mejora la imagen para mejor OCR."""
    from PIL import Image, ImageFilter, ImageEnhance
    # Escala de grises
    img = img.convert("L")
    # Aumentar contraste
    img = ImageEnhance.Contrast(img).enhance(2.0)
    # Nitidez
    img = img.filter(ImageFilter.SHARPEN)
    return img


def _extract_text(img) -> str:
    """Corre Tesseract sobre la imagen y devuelve texto."""
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
    # lang=spa+eng para soportar español e inglés
    return pytesseract.image_to_string(img, lang="spa+eng", config="--psm 6")


def _parse_menu_text(text: str) -> List[Dict[str, Any]]:
    """
    Parsea el texto crudo del OCR e intenta extraer platos.
    Estrategia:
      - Detectar encabezados de categoría (líneas en mayúsculas sin precio)
      - Detectar platos: línea con texto + precio en la misma o siguiente línea
    """
    dishes: List[Dict[str, Any]] = []
    current_category = "General"

    # Patrones de precio: $12.50 | 12,500 | 12.50 | $ 12 | COP 12000
    price_pattern = re.compile(
        r"(?:COP\s*|USD\s*|\$\s*)?([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(?:COP|USD)?",
        re.IGNORECASE,
    )

    lines = [l.strip() for l in text.splitlines() if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # Saltar líneas muy cortas o solo símbolos
        if len(line) < 3 or re.fullmatch(r"[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]+", line):
            i += 1
            continue

        # Detectar categoría: línea en MAYÚSCULAS sin precio, longitud razonable
        if (line.isupper() or line.istitle()) and len(line) < 40 and not price_pattern.search(line):
            current_category = line.title()
            i += 1
            continue

        # Intentar extraer precio de la línea actual o la siguiente
        price_match = price_pattern.search(line)
        price_line = line

        if not price_match and i + 1 < len(lines):
            next_line = lines[i + 1]
            price_match = price_pattern.search(next_line)
            if price_match:
                price_line = next_line
                i += 1  # consumir línea siguiente

        if price_match:
            raw_price = price_match.group(1).replace(",", "").replace(".", "")
            # Heurística: si tiene más de 4 dígitos es precio colombiano (12000 → 12000)
            # si tiene ≤4 dígitos tratar como decimales (12.50 → 1250 → /100)
            try:
                price_val = float(raw_price)
                if price_val > 9999:
                    price = price_val           # COP style
                else:
                    price = price_val           # USD / pequeño
            except ValueError:
                price = 0.0

            # Nombre del plato = línea sin el precio
            name = price_pattern.sub("", line).strip(" .-–—$")
            name = re.sub(r"\s{2,}", " ", name).strip()

            if len(name) >= 3:
                dishes.append({
                    "name": name[:80],
                    "price": price,
                    "category": current_category,
                    "description": "",
                })

        i += 1

    return dishes


def scan_menu(file_bytes: bytes, content_type: str) -> Dict[str, Any]:
    """
    Punto de entrada principal.
    Devuelve: { dishes: [...], raw_text: str, pages: int }
    """
    try:
        images = _get_images_from_file(file_bytes, content_type)
    except Exception as e:
        logger.error(f"Error leyendo archivo: {e}")
        raise ValueError(f"No se pudo leer el archivo: {e}")

    all_text = ""
    for img in images:
        processed = _preprocess_image(img)
        all_text += _extract_text(processed) + "\n\n"

    dishes = _parse_menu_text(all_text)

    return {
        "dishes": dishes,
        "raw_text": all_text[:3000],   # preview para debug
        "pages": len(images),
        "found": len(dishes),
    }
