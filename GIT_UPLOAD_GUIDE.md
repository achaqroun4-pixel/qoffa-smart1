# رفع Qoffa إلى GitHub بدون أسرار

هذه النسخة جاهزة كبداية جديدة في Git. تم حذف مجلد `.git` منها حتى لا ينتقل أي history قديم أو secret إلى repository الجديد.

من داخل هذا المجلد نفّذ:

```bash
git init
git branch -M main
git add .
git status
git commit -m "Initial secure Qoffa website"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

قبل `git commit` تأكد أن `.env` و`.dev.vars` غير موجودين، وأن `assets/js/runtime-config.js` لا يحتوي على أي Baserow token. رابط الـ Worker العمومي يمكن وضعه هناك، أما `BASEROW_TOKEN` فيبقى Secret داخل Cloudflare Worker فقط.

بعد نجاح الـ push، فعّل GitHub Pages من `Settings → Pages` باستعمال branch `main` والمجلد `/ (root)`. الصفحات النظيفة موجودة داخل مجلدات `products/`, `contact/`, `about/`, `order/` وغيرها، لذلك ستعمل بصيغة `/products/` و`/contact/` بدون `.html`. ملف `CNAME` جاهز للدومين `www.qoffasmart.ma`؛ فعّل DNS وHTTPS من إعدادات GitHub Pages بعد نشر المشروع.
