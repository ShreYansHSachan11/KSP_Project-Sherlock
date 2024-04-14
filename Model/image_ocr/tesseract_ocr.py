import pytesseract
from PIL import Image, ImageDraw, ImageFont
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

def anonymize_text_on_image(image_path: str):
    extracted_text = pytesseract.image_to_string(Image.open(image_path))

    print(extracted_text)
    return

    analyzer = AnalyzerEngine()
    analyzed_text = analyzer.analyze(extracted_text, language="en")
    
    anonymizer = AnonymizerEngine()
    anonymized_text = anonymizer.anonymize(extracted_text, analyzer_results=analyzed_text)


    layout_info = pytesseract.image_to_boxes(Image.open(image_path)).splitlines()


    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    font = ImageFont.load_default()

    # Draw the anonymized text onto the image with preserved layout

    for box_info in layout_info:
        char, x, y, x2, y2, _ = box_info.split()
        x, y, x2, y2 = int(x), int(y), int(x2), int(y2)
        text_in_box = extracted_text[int(char)-1] if char.isdigit() else char
        draw.text((x, image.size[1] - y), text_in_box, font=font, fill="black")

    anonymized_image_path = "anonymized_sample.jpg"
    image.save(anonymized_image_path)
    
    return anonymized_image_path
