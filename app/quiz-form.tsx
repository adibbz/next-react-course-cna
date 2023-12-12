import { revalidatePath } from 'next/cache';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

function Answer({id }: { id: number}) {
  return (
    <label>
      Answer {id}
      <input 
        className="bg-gray-50 border border-gray-200 rounded p-1 text-gray-900"
        type="text"
        name={`answer-${id}`} 
      />
      <input type="checkbox" name={`correct-${id}`} />
    </label>
  )
}

export default function QuizForm() {
  async function createQuiz(formData: FormData) {
    'use server';
    let title = formData.get('title') as string;
    let description = formData.get('description') as string;
    let question = formData.get('question') as string;
    let answers = [1,2,3].map((id) => {
      return {
        answer: formData.get(`answer-${id}`) as string,
        isCorrect: formData.get(`correct-${id}`) === 'on',
      }
    });
   
    await sql`
      WITH new_quiz AS (
        INSERT INTO quizzes (title, description, question_text, create_at)
        VALUES (${title}, ${description}, ${question}, NOW())
        RETURNING quiz_id
      )
      INSERT INTO answers (quiz_id, answer_text, is_correct)
      VALUES
        ( (SELECT quiz_id from new_quiz), ${answers[0].answer}, ${answers[0].isCorrect}),
        ( (SELECT quiz_id from new_quiz), ${answers[1].answer}, ${answers[1].isCorrect}),
        ( (SELECT quiz_id from new_quiz), ${answers[2].answer}, ${answers[2].isCorrect})
    `;

    revalidatePath('/')
  }

  return (
    <form className="flex flex-col mt-8 max-w-xs" action={createQuiz}>
      <h3 className="text-xl font-semibold">Create Quiz</h3>
      <label>
        Title
        <input className="bg-gray-50 border border-gray-200 rounded p-1 text-gray-900" type="text" name="title" />
      </label>
      <label>
        Description
        <input className="bg-gray-50 border border-gray-200 rounded p-1 text-gray-900" type="text" name="description" />
      </label>
      <label>
        Question
        <input className="bg-gray-50 border border-gray-200 rounded p-1 text-gray-900" type="text" name="question" />
      </label>
      <div className="my-3" />
      <Answer id={1} />
      <Answer id={2} />
      <Answer id={3} />
      <button type="submit" className="bg-gray-200 text-gray-900 p-2 rounded hover:bg-gray-300 transition-all">Create Quiz</button>
    </form>
  )
}