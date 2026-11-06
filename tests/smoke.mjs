import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const [html,js,config,vercel,readme,data,css]=await Promise.all(['index.html','assets/app.js','config.js','vercel.json','README.md','assets/data.js','assets/styles.css'].map(f=>readFile(resolve(root,f),'utf8')));
assert.match(html,/GIEO PRISM/);
assert.match(html,/id="open-google-form"/);
assert.match(html,/id="specialist-questions"/);
assert.match(html,/type="submit"[^>]*>↓ Xuất CV PDF/);
assert.doesNotMatch(html,/Nguyện vọng 2|Hỗ trợ viết giới thiệu|Dữ liệu thuộc về bạn|Không tài khoản · Không database|Xuất CV &amp; tự nộp hồ sơ|Xuất CV & tự nộp hồ sơ/i);
assert.doesNotMatch(html,/<script[^>]*src=["']https?:\/\//i);
assert.doesNotMatch(html,/id="secondaryDepartment"|id="specialAnswer"|id="generate-intro"|admin\.html/);
assert.match(config,/https:\/\/forms\.gle\/DwpvgDW2SwatiURV6/);
assert.match(js,/type="checkbox" name="departments"/);
assert.match(js,/data-special-key/);
assert.match(js,/professionalQuestions/);
assert.match(js,/setupMotion/);
assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(|\/api\/applications|sendBeacon/);
assert.match(vercel,/"framework": null/);
assert.match(readme,/Vercel/);
let sandbox={window:{}};
vm.runInNewContext(data,sandbox);
assert.equal(sandbox.window.GIEO_DATA.departments.length,4);
const banks=sandbox.window.GIEO_DATA.departments.map(d=>d.professionalQuestions);
assert.deepEqual(Array.from(banks,q=>q.length),[3,3,3,3]);
assert.equal(new Set(banks.flat().map(q=>String(q).trim())).size,12);
assert.equal(sandbox.window.GIEO_DATA.quiz.length,12);
await stat(resolve(root,'assets/gieo-logo.png'));
await stat(resolve(root,'assets/gieo-team.webp'));
const port=48776;
const child=spawn(process.execPath,['tools/preview.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'pipe'});
try{
 let response;for(let i=0;i<50;i++){try{response=await fetch(`http://127.0.0.1:${port}/`);if(response.status===200)break;}catch{}await new Promise(r=>setTimeout(r,90));}
 assert.equal(response?.status,200);
 assert.match(await response.text(),/GIEO PRISM/);
 for(const file of ['/assets/styles.css','/assets/data.js','/assets/app.js','/assets/gieo-team.webp','/assets/gieo-logo.png','/config.js']){
  const r=await fetch(`http://127.0.0.1:${port}${file}`);assert.equal(r.status,200,file);
 }
 const post=await fetch(`http://127.0.0.1:${port}/`,{method:'POST',body:'sensitive data'});assert.equal(post.status,405);
 for(const file of ['/api/applications','/admin.html','/server.mjs','/tools/preview.mjs']){
  const r=await fetch(`http://127.0.0.1:${port}${file}`);assert.equal(r.status,404,file);
 }
 console.log('✓ Trang chủ, JS, CSS, logo, ảnh CLB hoạt động');
 console.log('✓ 4 ban × 3 câu chuyên môn; quiz 12 câu; cho phép chọn nhiều ban');
 console.log('✓ Form Google chính thức đã cấu hình; không còn Nguyện vọng 2 hoặc phần nội dung thừa');
 console.log('✓ Không có API nhận hồ sơ, không có trang quản trị hoặc cơ chế lưu nháp');
}finally{child.kill('SIGTERM');}
