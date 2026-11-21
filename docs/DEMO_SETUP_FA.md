# راهنمای انتشار GitHub Pages

GitHub Pages در این مخزن **صفحه معرفی پروژه** و یک **نمونه آموزشی مستقل Three.js** را ارائه می‌کند؛ بازی اصلی `2.5.250` روی وردپرس برقتو اجرا می‌شود.

- صفحه معرفی: https://babakbinesh23.github.io/smart-energy-city/
- نمونه آموزشی جداگانه: https://babakbinesh23.github.io/smart-energy-city/reference/
- بازی واقعی روی سایت اصلی: https://www.bodara.ir/barghetocity/

## تنظیم انتشار

1. در GitHub وارد Settings → Pages شو.
2. در Build and deployment، مقدار Source باید **GitHub Actions** باشد.
3. گردش کار `.github/workflows/pages.yml` پس از تغییرات شاخه `main` به‌طور خودکار Build و Deploy را انجام می‌دهد.
4. گردش کار دو Job مستقل دارد: Build و Upload Artifact، سپس Deploy؛ این تفکیک برای رفع خطای قبلی شناسایی Artifact انجام شده است.
5. برای بررسی خطاها از تب Actions استفاده کن.

## بررسی پس از انتشار

- [ ] صفحه معرفی باز می‌شود و لینک ورود به بازی اصلی معتبر است
- [ ] صفحه `/reference/` باز می‌شود و WebGL، انتخاب بخش و اسلایدرها کار می‌کنند
- [ ] Build و Deploy در GitHub Actions هر دو سبز هستند
- [ ] هیچ‌کدام از داده‌های خصوصی یا مدل‌های فاقد مجوز در GitHub Pages قرار ندارند

توجه: موفقیت تست و Build به معنی تست کامل VR، چندنفره یا سرور وردپرس واقعی نیست.
