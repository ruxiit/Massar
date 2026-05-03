async function test() {
  const form = new FormData();
  form.append('title', 'Test Title');
  form.append('abstract', 'Test Abstract');
  form.append('file', new Blob(['hello world'], { type: 'application/pdf' }), 'test.pdf');

  try {
    const res = await fetch('http://localhost:3000/api/dossiers', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch (e) {
    console.log('Fetch error:', e);
  }
}

test();
