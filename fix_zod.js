const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'admin-login', 'route.ts');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace('result.error.errors[0]?.message', 'result.error.issues[0]?.message');
fs.writeFileSync(targetFile, content);
console.log('Fixed zod error accessor');
