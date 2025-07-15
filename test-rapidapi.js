import https from 'https';

// Test RapidAPI connection
const rapidApiKey = process.env.RAPIDAPI_KEY;
console.log('🔑 Testing with RapidAPI key:', rapidApiKey ? 'EXISTS' : 'MISSING');

if (!rapidApiKey) {
  console.error('❌ RAPIDAPI_KEY environment variable not found');
  process.exit(1);
}

const options = {
  method: 'GET',
  hostname: 'youtube-v2.p.rapidapi.com',
  port: null,
  path: '/channel/videos?channel_id=UCccs9hxFuzq77stdELIU59w',
  headers: {
    'x-rapidapi-key': rapidApiKey,
    'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
  }
};

console.log('🌐 Making request to:', `https://${options.hostname}${options.path}`);
console.log('🔧 Headers:', options.headers);

const req = https.request(options, (res) => {
  console.log('📊 Status Code:', res.statusCode);
  console.log('📋 Response Headers:', res.headers);
  
  const chunks = [];

  res.on('data', (chunk) => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    console.log('📄 Response Body Length:', body.length);
    console.log('📄 Response Body (first 1000 chars):', body.substring(0, 1000));
    
    if (body.length > 0) {
      try {
        const parsed = JSON.parse(body);
        console.log('✅ JSON parsed successfully');
        console.log('🔍 Response structure:', Object.keys(parsed));
        
        if (parsed.videos) {
          console.log('🎬 Videos found:', Array.isArray(parsed.videos) ? parsed.videos.length : 'not an array');
          if (Array.isArray(parsed.videos) && parsed.videos.length > 0) {
            console.log('🎥 First video sample:', JSON.stringify(parsed.videos[0], null, 2));
          }
        } else {
          console.log('❌ No videos property in response');
        }
      } catch (error) {
        console.error('❌ Error parsing JSON:', error.message);
      }
    } else {
      console.log('⚠️  Empty response body');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.setTimeout(10000, () => {
  console.error('⏰ Request timeout after 10 seconds');
  req.destroy();
});

req.end();