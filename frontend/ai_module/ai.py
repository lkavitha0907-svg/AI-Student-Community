from pdf_reader import extract_text_from_pdf
import random

def generate_questions(text):
    sentences = text.split(".")
    questions = []

    for sentence in sentences:
        words = sentence.split()

        if len(words) > 6:
            question = {
                "question": "What does the following statement describe?",
                "statement": sentence.strip(),
                "options": [
                    "Artificial Intelligence",
                    "Machine Learning",
                    "Data Science",
                    "Cloud Computing"
                ],
                "answer": "Artificial Intelligence"
            }

            questions.append(question)

    return questions

def generate_quiz_from_pdf(pdf_file):
    from pdf_reader import extract_text_from_pdf

    # Extract text from the PDF
    text = extract_text_from_pdf(pdf_file)

    # Generate questions from extracted text
    questions = generate_questions(text)

    return questions


# Test example
if __name__ == "__main__":
    sample_text = """
    Artificial Intelligence is the simulation of human intelligence by machines.
    Machine Learning allows computers to learn from data.
    Data Science is used to analyze large datasets.
    """

    quiz = generate_questions(sample_text)

    for q in quiz:
        print(q)
