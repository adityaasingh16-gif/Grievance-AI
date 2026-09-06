import re

def summarize_text(text, max_sentences=2):
    if len(text) < 120:
        return text

    # Split into clean sentences
    clean_text = text.replace('\n', ' ')
    sentences = [s.strip() for s in re.split(r'[.!?।]', clean_text) if len(s.strip()) > 10]

    if not sentences:
        return text[:150] + "..."

    if len(sentences) <= max_sentences:
        return '. '.join(sentences) + '.'

    # Pick first sentence and longest informative sentence
    selected = [sentences[0]]
    remaining = sorted(sentences[1:], key=len, reverse=True)
    selected.append(remaining[0])

    # Reorder by appearance order
    selected = sorted(selected, key=lambda s: text.find(s))
    return '. '.join(selected) + '.'
