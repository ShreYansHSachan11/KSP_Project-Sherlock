from collections import defaultdict
from io import BytesIO
from PIL import Image
from pydantic import BaseModel
import uvicorn, urllib3, spacy, nest_asyncio, base64
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern, RecognizerRegistry
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig, OperatorResult
from presidio_anonymizer.operators import Operator, OperatorType
from presidio_image_redactor import ImageRedactorEngine
import pytesseract
import json

nlp = spacy.load("/Users/amanetize/Documents/KSP/custom-ner/PERSON/trained_PERSON")
nlp = spacy.load("/Users/amanetize/Documents/KSP/custom-ner/ADDRESS/trained_ADDRESS")

from entity_mapping import InstanceCounterAnonymizer
from overlapping import filter_overlapping_entities


from presidio_analyzer.predefined_recognizers import (
   AzureAILanguageRecognizer,
   SpacyRecognizer,
  #  InAadhaarRecognizer,
  #  InPanRecognizer,
  #  InVehicleRegistrationRecognizer,
)

recognizer_classes = [
    SpacyRecognizer,
    AzureAILanguageRecognizer,
    # InAadhaarRecognizer,
    # InPanRecognizer,
    # InVehicleRegistrationRecognizer
]

# spacy_recognizer = SpacyRecognizer()
# azure_recognizer = AzureAILanguageRecognizer()

new_registry = RecognizerRegistry()
for recognizer_class in recognizer_classes:
    recognizer_instance = recognizer_class()
    new_registry.add_recognizer(recognizer_instance)

yaml_file = "recognizers.yaml"
new_registry.add_recognizers_from_yaml(yaml_file)


app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
     allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

class direct(BaseModel):
  text: str
@app.post("/")
async def direct(input: direct):

  analyzer = AnalyzerEngine(registry=new_registry)
  analyzed_text = analyzer.analyze(input.text, language="en")
  
  anonymizer = AnonymizerEngine()
  anonymized_text = anonymizer.anonymize(text=input.text, analyzer_results=analyzed_text)
  
  return anonymized_text

filtered_entities = None
class text_input(BaseModel):
  text: str
@app.post('/text')
async def analyze_text(input_text : text_input):
  analyzer = AnalyzerEngine(registry=new_registry)
  analyzed_text = analyzer.analyze(text=input_text.text, language="en")

  global filtered_entities
  filtered_entities = filter_overlapping_entities(analyzed_text)
  return filtered_entities


class entities_input(BaseModel):
    text : str
    entities: list[str]
    type: str
@app.post("/anonymize")
async def anonymize_text(pii: entities_input):
    entities = pii.entities
    if not entities:
      raise HTTPException(status_code=400, detail="At least one entity type must be provided.")

    anonymizer = AnonymizerEngine()
    operator_config = OperatorConfig(pii.type)

    entity_mapping = None

    if pii.type == 'replace':
      entity_mapping = dict()
      operator_config = OperatorConfig("entity_counter", {"entity_mapping": entity_mapping})
      anonymizer.add_anonymizer(InstanceCounterAnonymizer)

    global filtered_entities
    if filtered_entities == None:
      analyzer = AnalyzerEngine(registry=new_registry)
      filtered_entities = analyzer.analyze(text=pii.text, entities=entities, language="en")

    anonymized_text = anonymizer.anonymize(text= pii.text, analyzer_results=filtered_entities, operators={"DEFAULT": operator_config})

    return {
        "anonymized_text": anonymized_text,
        "entity_mapping": entity_mapping
    }


@app.post("/image")
async def redact_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image'):
        raise HTTPException(status_code=415, detail="Unsupported Media Type")

    image = Image.open(BytesIO(await file.read()))
    engine = ImageRedactorEngine()
    redacted_image = engine.redact(image, (255, 192, 203))
    
    output_buffer = BytesIO()
    redacted_image.save(output_buffer, format="JPEG")
    output_buffer.seek(0)
    
    return StreamingResponse(output_buffer, media_type="image/jpeg")

@app.post("/i2t")
async def anonymize_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith('image'):
        raise HTTPException(status_code=415, detail="Unsupported Media Type")
    image = Image.open(BytesIO(await file.read()))
    extracted_text = pytesseract.image_to_string(image=image)

    return extracted_text


class de_ano(BaseModel):
    entity_mapping: str
    text: str

@app.post("/de-ano")
async def replace_entities(de_ano: de_ano):
    entity_mapping = json.loads(de_ano.entity_mapping)
    text = de_ano.text

    for entity_type, entity_values in entity_mapping.items():
        for original_text, unique_identifier in entity_values.items():
            text = text.replace(unique_identifier, original_text)

    return text
