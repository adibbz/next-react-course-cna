const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {});

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      quiz_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      question_text TEXT NOT NULL,
      create_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS answers (
      answer_id SERIAL PRIMARY KEY,
      quiz_id INT REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
      answer_text TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL
    );
  `;
};

async function main() {
  await createTables();
};

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});