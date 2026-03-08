import random

def generate_quiz(text):
    sentences = text.split(".")
    questions = []

    for sentence in sentences:
        words = sentence.split()

        if len(words) > 6:
            question = {
                "question": "What is the meaning of the following sentence?",
                "text": sentence.strip(),
                "options": [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                ],
                "answer": "Option A"
            }

            questions.append(question)

    return questions


# test example
if __name__ == "__main__":
    sample = "Artificial Intelligence is the simulation of human intelligence by machines. It is widely used in modern technology."

    quiz = generate_quiz(sample)

    print(quiz)