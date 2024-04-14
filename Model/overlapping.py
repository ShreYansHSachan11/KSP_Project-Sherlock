def filter_overlapping_entities(entities):
    filtered_entities = []
    
    for entity in entities:
        overlap = False
        for other_entity in entities:
            if entity != other_entity:
                if (entity.start >= other_entity.start and entity.start < other_entity.end) or \
                   (other_entity.start >= entity.start and other_entity.start < entity.end):
                    overlap = True
                    if entity.score > other_entity.score:
                        if entity not in filtered_entities:
                            filtered_entities.append(entity)
                    else:
                        if other_entity not in filtered_entities:
                            filtered_entities.append(other_entity)
        if not overlap:
            filtered_entities.append(entity)
    
    return filtered_entities