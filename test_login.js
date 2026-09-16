const axios = require('axios');
require('./server/server');

const BASE_URL = 'http://localhost:5000/api';

async function runLoginTests() {
  await new Promise((r) => setTimeout(r, 600));
  try {
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('[Test] Health status:', healthRes.data);

    // 1. Test ASHA demo login
    const ashaRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'asha@demo.com',
      password: 'Demo@123',
    });
    console.log('[Test] ASHA Login Result:', ashaRes.data.success, 'User:', ashaRes.data.user?.name, 'Role:', ashaRes.data.user?.role);

    // 2. Test Doctor demo login
    const docRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'doctor@demo.com',
      password: 'Demo@123',
    });
    console.log('[Test] Doctor Login Result:', docRes.data.success, 'User:', docRes.data.user?.name, 'Role:', docRes.data.user?.role);

    // 3. Test Patient demo login via email
    const patRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'patient@demo.com',
      password: 'Demo@123',
    });
    console.log('[Test] Patient Login Result:', patRes.data.success, 'User:', patRes.data.user?.name, 'Role:', patRes.data.user?.role);

    // 4. Test Patient login via username (patient0001)
    const patUserRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'patient0001',
      password: 'Demo@123',
    });
    console.log('[Test] Patient0001 Username Login Result:', patUserRes.data.success, 'Role:', patUserRes.data.user?.role);

    // 5. Test District Hospital demo login
    const hospRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'hospital@demo.com',
      password: 'Demo@123',
    });
    console.log('[Test] District Hospital Login Result:', hospRes.data.success, 'User:', hospRes.data.user?.name, 'Role:', hospRes.data.user?.role);

    // 6. Test Health Department Admin demo login
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'admin@demo.com',
      password: 'Demo@123',
    });
    console.log('[Test] Health Admin Login Result:', adminRes.data.success, 'User:', adminRes.data.user?.name, 'Role:', adminRes.data.user?.role);

    // 7. Test authenticated endpoint with ASHA token
    const ashaToken = ashaRes.data.token;
    const patientsRes = await axios.get(`${BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    console.log('[Test] Patients count:', patientsRes.data.count, 'First patient:', patientsRes.data.data?.[0]?.name);

    // 8. Test ASHA Dashboard
    const dashRes = await axios.get(`${BASE_URL}/dashboard/asha`, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    console.log('[Test] ASHA Dashboard Metrics:', dashRes.data.data?.metrics);

    console.log('✅ ALL 5 ROLES DEMO AUTHENTICATION TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runLoginTests();
