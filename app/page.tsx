import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';

const sql = neon(process.env.DATABASE_URL!);

// Деректерді оқитын бөлікті жеке компонентке бөлу
async function MessageList() {
  const messages = await sql`SELECT * FROM messages ORDER BY id DESC`;
  return (
    <div>
      {messages.map((item) => (
        <div
          key={item.id}
          style={{ padding: '12px', marginTop: '10px', background: '#eeeeee', borderRadius: '5px' }}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  async function addMessage(formData: FormData) {
    'use server';
    const message = String(formData.get('message') ?? '').trim();
    if (!message) return;

    const db = neon(process.env.DATABASE_URL!);
    await db`INSERT INTO messages (message) VALUES (${message})`;
    revalidatePath('/');
  }

  return (
    <main style={{ maxWidth: '700px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Менің алғашқы веб-қосымшам</h1>
      <p>Бұл қосымша Neon бұлттық деректер қорымен жұмыс істейді.</p>

      <form action={addMessage}>
        <input
          name="message"
          placeholder="Хабарлама енгізіңіз"
          required
          style={{ padding: '12px', width: '70%', marginRight: '10px' }}
        />
        <button type="submit">Сақтау</button>
      </form>

      <h2>Хабарламалар тізімі</h2>
      {/* Деректерді оқитын компонентті Suspense ішіне орау */}
      <Suspense fallback={<p>Хабарламалар жүктелуде...</p>}>
        <MessageList />
      </Suspense>
    </main>
  );
}