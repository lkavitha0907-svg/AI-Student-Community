import random
import re

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from uploaded PDF file."""
    try:
        import PyPDF2
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + " "
        return text.strip()
    except ImportError:
        return ""
    except Exception as e:
        print(f"PDF reading error: {e}")
        return ""

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from any supported file type."""
    if not file_path:
        return ""
    try:
        if file_type in ('pdf',):
            return extract_text_from_pdf(file_path)
        elif file_type in ('txt',):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        elif file_type in ('docx',):
            try:
                import docx
                doc = docx.Document(file_path)
                return ' '.join([p.text for p in doc.paragraphs])
            except ImportError:
                return ""
    except Exception as e:
        print(f"File reading error: {e}")
    return ""

def extract_key_concepts(text: str) -> list:
    """Extract key concepts and terms from text."""
    stop_words = {
        'the','a','an','and','or','but','in','on','at','to','for','of','with',
        'by','from','is','are','was','were','be','been','have','has','had',
        'do','does','did','will','would','could','should','may','might',
        'this','that','these','those','it','its','we','they','he','she','you','i',
        'as','if','so','not','no','can','also','than','then','when','where','which'
    }
    concepts = re.findall(r'\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b', text)
    concepts += re.findall(r'\b[a-z]+(?:[_-][a-z]+)+\b', text)
    seen = set()
    unique = []
    for c in concepts:
        lower = c.lower()
        if lower not in stop_words and len(c) > 3 and lower not in seen:
            seen.add(lower)
            unique.append(c)
    return unique[:20] if len(unique) >= 3 else ['Concept', 'Principle', 'Theory']

def generate_questions_from_text(text: str, num_questions: int = 5, user_seed: int = None) -> list:
    """
    AI Quiz Generation integrated from friend's ai-module branch.
    Reads note text or PDF content, generates MCQ questions.
    Replace this function with OpenAI/Gemini API when ready.
    """
    if not text or len(text.strip()) < 20:
        return _fallback_questions(num_questions)

    if user_seed:
        random.seed(user_seed)

    sentences = [
        s.strip() for s in re.split(r'[.!?]', text)
        if len(s.strip().split()) > 6
    ]

    concepts = extract_key_concepts(text)
    questions = []

    # Question type 1: Sentence-based (from friend's ai-module)
    for sentence in sentences[:max(num_questions, 3)]:
        words = sentence.split()
        if len(words) > 6:
            options_pool = [c for c in concepts if c.lower() not in sentence.lower()]
            random.shuffle(options_pool)
            wrong_opts = options_pool[:3]
            defaults = ['Artificial Intelligence','Machine Learning','Data Science','Cloud Computing']
            while len(wrong_opts) < 3:
                for d in defaults:
                    if d not in wrong_opts:
                        wrong_opts.append(d)
                    if len(wrong_opts) == 3:
                        break
            key_concept = concepts[0] if concepts else words[-1]
            all_opts = wrong_opts[:3] + [key_concept]
            random.shuffle(all_opts)
            correct = chr(65 + all_opts.index(key_concept))
            questions.append({
                'question_text': f"What does the following statement describe?\n\"{sentence.strip()}\"",
                'option_a': all_opts[0],
                'option_b': all_opts[1],
                'option_c': all_opts[2],
                'option_d': all_opts[3],
                'correct_answer': correct,
                'points': 10
            })

    # Question type 2: Concept-based questions
    for concept in concepts[:num_questions]:
        opts = [c for c in concepts if c != concept]
        random.shuffle(opts)
        wrong = opts[:3]
        while len(wrong) < 3:
            wrong.append('None of the above')
        all_opts = wrong[:3] + [concept]
        random.shuffle(all_opts)
        correct = chr(65 + all_opts.index(concept))
        questions.append({
            'question_text': f"Which of the following is a key concept discussed in the notes?",
            'option_a': all_opts[0],
            'option_b': all_opts[1],
            'option_c': all_opts[2],
            'option_d': all_opts[3],
            'correct_answer': correct,
            'points': 10
        })

    random.seed()
    random.shuffle(questions)
    return questions[:num_questions] if questions else _fallback_questions(num_questions)

def _fallback_questions(num_questions: int) -> list:
    """Fallback questions when notes are too short."""
    fallbacks = [
        {
            'question_text': "What is Artificial Intelligence?",
            'option_a': "Simulation of human intelligence by machines",
            'option_b': "A type of database system",
            'option_c': "A computer networking protocol",
            'option_d': "A programming language",
            'correct_answer': 'A',
            'points': 10
        },
        {
            'question_text': "What does Machine Learning allow computers to do?",
            'option_a': "Only execute pre-written instructions",
            'option_b': "Learn from data without being explicitly programmed",
            'option_c': "Connect to the internet faster",
            'option_d': "Store more data in memory",
            'correct_answer': 'B',
            'points': 10
        },
        {
            'question_text': "What is Data Science used for?",
            'option_a': "Designing computer hardware",
            'option_b': "Writing operating systems",
            'option_c': "Analyzing large datasets to extract insights",
            'option_d': "Building mobile applications",
            'correct_answer': 'C',
            'points': 10
        },
    ]
    return fallbacks[:num_questions]