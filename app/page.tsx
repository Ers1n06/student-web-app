import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';

const sql = neon(process.env.DATABASE_URL!);

async function MessageList() {
  const messages = await sql`SELECT * FROM messages ORDER BY id DESC`;

  // Жою функциясы
  async function deleteMessage(formData: FormData) {
    'use server';
    const id = formData.get('id');
    if (!id) return;
    const db = neon(process.env.DATABASE_URL!);
    await db`DELETE FROM messages WHERE id = ${id}`;
    revalidatePath('/');
  }

  return (
    <div>
      {messages.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '15px',
            marginTop: '10px',
            background: '#f4f4f4',
            color: 'black',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div>
            <strong style={{ fontSize: '1.1em', color: '#0070f3' }}>
              {item.student_name || 'Белгісіз студент'}
            </strong>
            <p style={{ margin: '5px 0' }}>{item.message}</p>
            <small style={{ color: '#666' }}>
              🕒 {new Date(item.created_at).toLocaleString('kk-KZ')}
            </small>
          </div>
          
          {/* Жою батырмасы */}
          <form action={deleteMessage}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              style={{
                padding: '8px 12px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Жою
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  // Хабарлама қосу функциясы
  async function addMessage(formData: FormData) {
    'use server';
    const message = String(formData.get('message') ?? '').trim();
    const studentName = String(formData.get('student_name') ?? '').trim();
    if (!message) return;

    const db = neon(process.env.DATABASE_URL!);
    await db`INSERT INTO messages (message, student_name) VALUES (${message}, ${studentName})`;
    revalidatePath('/');
  }

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Менің алғашқы веб-қосымшам</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Бұл қосымша Neon бұлттық деректер қорымен жұмыс істейді.
      </p>

      {/* Енгізу формасы */}
      <form action={addMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <input
          name="student_name"
          placeholder="Студенттің аты-жөні"
          required
          style={{ padding: '12px', color: 'black', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px' }}
        />
        <textarea
          name="message"
          placeholder="Хабарлама енгізіңіз"
          required
          rows={3}
          style={{ padding: '12px', color: 'black', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
        />
        <button
          type="submit"
          style={{ padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Сақтау
        </button>
      </form>

      <h2 style={{ color: '#333', borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>
        Хабарламалар тізімі
      </h2>
      
      <Suspense fallback={<p style={{ color: 'black' }}>Хабарламалар жүктелуде...</p>}>
        <MessageList />
      </Suspense>
    </main>
  );
}