const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const Message = require('../server/models/Message');
const ArtistProfile = require('../server/models/ArtistProfile');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const messages = await Message.find({});
  console.log('Total messages:', messages.length);

  messages.forEach(m => {
    console.log(`Msg: ${m.text.substring(0, 20)}... | From: ${m.sender} | To: ${m.recipient} | ToModel: ${m.recipientModel}`);
  });

  const artists = await ArtistProfile.find({});
  console.log('Total artists:', artists.length);
  artists.forEach(a => {
    console.log(`Artist: ${a.name} | ID: ${a._id}`);
  });

  await mongoose.disconnect();
}

check();
