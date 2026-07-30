const base = 'http://localhost:5000';

(async () => {
  try {
    const creds = { email: 'admin@nestify.app', password: 'Admin123!' };
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    const login = await loginRes.json();
    console.log('LOGIN_STATUS', loginRes.status);
    console.log('LOGIN_BODY', JSON.stringify(login));
    if (!login.token) {
      process.exit(1);
    }

    const stylesRes = await fetch(`${base}/api/styles`);
    const styles = await stylesRes.json();
    console.log('STYLES_STATUS', stylesRes.status);
    console.log('STYLES_COUNT', Array.isArray(styles) ? styles.length : 'unknown');
    const imageId = styles?.[0]?.images?.[0]?.id;
    console.log('IMAGE_ID', imageId);

    const createRes = await fetch(`${base}/api/moodboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + login.token,
      },
      body: JSON.stringify({ title: 'Test Moodboard', projectId: null }),
    });
    const createBody = await createRes.json();
    console.log('CREATE_MOODBOARD_STATUS', createRes.status);
    console.log('CREATE_MOODBOARD_BODY', JSON.stringify(createBody));

    if (imageId && createBody?.id) {
      const addRes = await fetch(`${base}/api/moodboards/${createBody.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + login.token,
        },
        body: JSON.stringify({ imageId }),
      });
      const addBody = await addRes.json();
      console.log('ADD_ITEM_STATUS', addRes.status);
      console.log('ADD_ITEM_BODY', JSON.stringify(addBody));
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
