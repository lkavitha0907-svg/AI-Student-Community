import random
import re
import os

def extract_text_from_pdf(file_path: str) -> str:
    try:
        import PyPDF2
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + " "
        return text.strip()
    except Exception as e:
        print(f"PDF reading error: {e}")
        return ""

def extract_text_from_file(file_path: str, file_type: str) -> str:
    if not file_path:
        return ""
    try:
        if file_type == 'pdf':
            return extract_text_from_pdf(file_path)
        elif file_type == 'txt':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        elif file_type == 'docx':
            try:
                import docx
                doc = docx.Document(file_path)
                return ' '.join([p.text for p in doc.paragraphs])
            except ImportError:
                return ""
    except Exception as e:
        print(f"File reading error: {e}")
    return ""

def generate_questions_with_gemini(text: str, num_questions: int, user_seed: int = None) -> list:
    try:
        import google.generativeai as genai
        import json

        api_key = os.environ.get('GEMINI_API_KEY', '')
        if not api_key:
            print("No Gemini API key found, using mock AI")
            return []

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Each student gets different questions using seed
        variation = f"Generate variation #{user_seed % 5 + 1} of questions." if user_seed else ""

        prompt = f"""
You are a quiz generator for students. Read the following study notes carefully and generate exactly {num_questions} multiple choice questions. {variation}

STRICT RULES:
- Questions must be based ONLY on the notes content
- Each question must have exactly 4 meaningful options (A, B, C, D)
- Options must be real concepts, terms or facts — NOT generic words like "Introduction", "Types", "Each", "Common"
- Only ONE option is correct
- Make questions educational, clear and varied in difficulty
- Mix different question types: definition, application, comparison
- Return ONLY a valid JSON array, no other text, no markdown, no backticks

Return format exactly like this:
[
  {{
    "question_text": "What is...?",
    "option_a": "First meaningful option",
    "option_b": "Second meaningful option",
    "option_c": "Third meaningful option",
    "option_d": "Fourth meaningful option",
    "correct_answer": "A",
    "points": 10
  }}
]

STUDY NOTES:
{text[:4000]}
"""
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith('```'):
            response_text = re.sub(r'```json\n?|```\n?', '', response_text).strip()

        questions = json.loads(response_text)

        valid = []
        for q in questions:
            if all(k in q for k in ['question_text','option_a','option_b','option_c','option_d','correct_answer']):
                q['points'] = 10
                q['correct_answer'] = q['correct_answer'].upper()
                valid.append(q)

        print(f"Gemini generated {len(valid)} questions!")
        return valid

    except Exception as e:
        print(f"Gemini error: {e}, falling back to mock AI")
        return []

def extract_key_concepts(text: str) -> list:
    """Extract meaningful concepts — skip generic section headers."""
    # Words to skip — these are NOT good quiz answers
    skip_words = {
        'introduction', 'overview', 'summary', 'conclusion', 'types', 'type',
        'each', 'common', 'example', 'examples', 'section', 'chapter',
        'table', 'figure', 'note', 'notes', 'page', 'students', 'study',
        'following', 'above', 'below', 'first', 'second', 'third',
        'also', 'however', 'therefore', 'thus', 'hence', 'moreover',
        'furthermore', 'additionally', 'finally', 'lastly', 'next',
        'computer', 'network', 'networks', 'system', 'systems',
        'data', 'information', 'used', 'using', 'uses', 'use',
        'based', 'called', 'known', 'different', 'various', 'several',
    }

    # Extract meaningful technical terms (2+ words or specific technical terms)
    multi_word = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b', text)
    single_tech = re.findall(r'\b(?:TCP|UDP|IP|DNS|DHCP|HTTP|FTP|LAN|WAN|MAN|PAN|OSI|MAC|VPN|SSL|TLS|ARP|OSPF|VoIP|QoS|VLAN|NAT|SMTP|FTP|SSH|ICMP)\b', text)

    # Extract capitalized phrases but filter out generic ones
    all_concepts = multi_word + single_tech

    seen = set()
    unique = []
    for c in all_concepts:
        lower = c.lower().strip()
        # Skip if it's in skip list or too short or a number
        if (lower not in skip_words and
            len(c) > 4 and
            not c[0].isdigit() and
            not any(skip in lower for skip in skip_words) and
            lower not in seen):
            seen.add(lower)
            unique.append(c)

    # If we don't have enough good concepts, extract domain-specific terms
    if len(unique) < 8:
        domain_terms = re.findall(
            r'\b(?:router|switch|hub|firewall|protocol|bandwidth|latency|packet|'
            r'ethernet|topology|subnet|gateway|server|client|node|port|cable|'
            r'fiber|wireless|broadcast|unicast|multicast|encryption|authentication|'
            r'algorithm|database|software|hardware|memory|processor|storage)\b',
            text.lower()
        )
        for t in domain_terms:
            cap = t.capitalize()
            if cap.lower() not in seen and cap.lower() not in skip_words:
                seen.add(cap.lower())
                unique.append(cap)

    return unique[:25] if unique else ['Local Area Network', 'Wide Area Network', 'TCP Protocol', 'IP Address']

def generate_questions_from_text(text: str, num_questions: int = 10, user_seed: int = None) -> list:
    """
    Main quiz generation function.
    Uses user_seed to give each student different questions.
    Tries Gemini AI first, falls back to mock if no API key.
    """
    if not text or len(text.strip()) < 20:
        return _fallback_questions(num_questions)

    # Try Gemini AI first
    gemini_questions = generate_questions_with_gemini(text, num_questions, user_seed)
    if gemini_questions:
        # Shuffle differently per user using seed
        if user_seed:
            random.seed(user_seed)
            random.shuffle(gemini_questions)
            random.seed()
        return gemini_questions[:num_questions]

    # Fallback mock AI
    print("Using mock AI...")
    if user_seed:
        random.seed(user_seed)

    sentences = [
        s.strip() for s in re.split(r'[.!?]', text)
        if len(s.strip().split()) > 8
    ]

    concepts = extract_key_concepts(text)
    print(f"Extracted concepts: {concepts[:10]}")

    questions = []

    # Only use sentences that have meaningful content
    good_sentences = []
    skip_patterns = ['introduction', 'table of contents', 'chapter', 'section',
                     'figure', 'page', 'study notes', 'complete notes']
    for sentence in sentences:
        lower = sentence.lower()
        if not any(pat in lower for pat in skip_patterns) and len(sentence.split()) > 8:
            good_sentences.append(sentence)

    # Shuffle sentences differently per user
    random.shuffle(good_sentences)

    # Question type 1: Concept definition questions
    # Question type 1: Definition/explanation questions
    question_templates = [
        "What is {concept}?",
        "Which of the following best describes {concept}?",
        "What does {concept} refer to in this context?",
        "How is {concept} defined in these notes?",
        "What is the primary purpose of {concept}?",
        "What does {concept} mean?",
        "Which statement correctly describes {concept}?",
        "What role does {concept} play?",
    ]

    for i, concept in enumerate(concepts[:num_questions]):
        opts = [c for c in concepts if c != concept]
        random.shuffle(opts)
        wrong = opts[:3]
        extras = ['Ethernet Protocol', 'Network Router', 'Data Packet',
                  'IP Address', 'MAC Address', 'Network Switch',
                  'Firewall System', 'Bandwidth Control',
                  'Encryption Key', 'Access Control', 'Data Mining',
                  'Cloud Storage', 'Load Balancer', 'API Gateway']
        while len(wrong) < 3:
            for e in extras:
                if e not in wrong and e != concept:
                    wrong.append(e)
                if len(wrong) == 3:
                    break

        all_opts = wrong[:3] + [concept]
        random.shuffle(all_opts)
        correct = chr(65 + all_opts.index(concept))
        template = question_templates[i % len(question_templates)]

        questions.append({
            'question_text': template.format(concept=concept),
            'option_a': all_opts[0],
            'option_b': all_opts[1],
            'option_c': all_opts[2],
            'option_d': all_opts[3],
            'correct_answer': correct,
            'points': 10
        })

    # Question type 2: Sentence-based with meaningful options only
    for sentence in good_sentences[:num_questions]:
        if len(concepts) < 4:
            break

        # Find concepts mentioned in this sentence
        mentioned = [c for c in concepts if c.lower() in sentence.lower()]
        not_mentioned = [c for c in concepts if c.lower() not in sentence.lower()]

        if not mentioned or len(not_mentioned) < 3:
            continue

        correct_concept = mentioned[0]
        random.shuffle(not_mentioned)
        wrong_opts = not_mentioned[:3]

        all_opts = wrong_opts + [correct_concept]
        random.shuffle(all_opts)
        correct = chr(65 + all_opts.index(correct_concept))

        # Skip sentences that are too long or are section headers
        if len(sentence) > 200:
            sentence = sentence[:200] + '...'

        stmt_templates = [
            f"What concept does this statement explain?\n\"{sentence.strip()}\"",
            f"This statement is describing which of the following?\n\"{sentence.strip()}\"",
            f"Which topic does the following statement belong to?\n\"{sentence.strip()}\"",
            f"Read the statement and identify the correct concept:\n\"{sentence.strip()}\"",
        ]
        q_text = stmt_templates[len(questions) % len(stmt_templates)]
        questions.append({
            'question_text': q_text,
            'option_a': all_opts[0],
            'option_b': all_opts[1],
            'option_c': all_opts[2],
            'option_d': all_opts[3],
            'correct_answer': correct,
            'points': 10
        })

    random.seed()
    random.shuffle(questions)

    # Remove duplicates
    seen_q = set()
    unique_q = []
    for q in questions:
        key = q['question_text'][:50]
        if key not in seen_q:
            seen_q.add(key)
            unique_q.append(q)

    return unique_q[:num_questions] if unique_q else _fallback_questions(num_questions)

def _fallback_questions(num_questions: int) -> list:
    fallbacks = [
        {'question_text': "What does LAN stand for?",
         'option_a': "Local Area Network", 'option_b': "Large Area Network",
         'option_c': "Linked Access Node", 'option_d': "Light Access Network",
         'correct_answer': 'A', 'points': 10},
        {'question_text': "Which protocol is connection-oriented and guarantees delivery?",
         'option_a': "UDP", 'option_b': "HTTP", 'option_c': "TCP", 'option_d': "FTP",
         'correct_answer': 'C', 'points': 10},
        {'question_text': "What does DNS translate?",
         'option_a': "IP to MAC addresses", 'option_b': "Domain names to IP addresses",
         'option_c': "HTTP to HTTPS", 'option_d': "Ports to protocols",
         'correct_answer': 'B', 'points': 10},
        {'question_text': "Which device operates at Layer 3 of the OSI model?",
         'option_a': "Hub", 'option_b': "Switch", 'option_c': "Router", 'option_d': "Repeater",
         'correct_answer': 'C', 'points': 10},
        {'question_text': "What is the maximum number of layers in the OSI model?",
         'option_a': "5", 'option_b': "6", 'option_c': "8", 'option_d': "7",
         'correct_answer': 'D', 'points': 10},
    ]
    return (fallbacks * 3)[:num_questions]