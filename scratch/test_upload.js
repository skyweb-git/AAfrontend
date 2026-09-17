const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const token = jwt.sign(
      {
        artistId: '6a0b139a7bd013938ce59bbf',
        email: 'abbupasha61@gmail.com',
        userId: '6a02ebecfde49e16f7c8861d' // Associated User ID
      },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    console.log('Generated Token:', token);

    const form = new FormData();
    form.append('productData', JSON.stringify({
      name: 'Whisper test scratch',
      category: 'Painting',
      description: 'A gorgeous test piece from scratch.',
      status: 'available',
      artistProfile: '6a0b139a7bd013938ce59bbf'
    }));

    // Create a dummy image buffer for upload
    const dummyBuffer = Buffer.from('dummy-image-content-here-to-test-upload');
    form.append('images', dummyBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });

    console.log('Sending upload request to backend...');
    const response = await axios.post('https://sverxiioo.nanoprofiles.com/api/products', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload Success:', response.data);
  } catch (error) {
    console.error('Upload Failed with status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

run();
