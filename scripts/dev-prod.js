// Runner for Production Local Dev Server (Port 3000)
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

// Forward to Next.js CLI on port 3000
process.argv = [process.argv[0], process.argv[1], 'dev', '-p', '3000'];
require('next/dist/bin/next');
