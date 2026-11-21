# انتشار دمو با GitHub Pages

**Demo target:** https://babakbinesh23.github.io/smart-energy-city/

کد GitHub Actions برای Build و Deploy آماده است: `.github/workflows/pages.yml`. این دمو همان **نمونه مستقل Three.js** است؛ نسخه وردپرسی تولیدی نیست.

## فعال‌سازی یک‌باره در GitHub

1. به https://github.com/babakbinesh23/smart-energy-city/settings/pages برو.
2. در بخش **Build and deployment**، مقدار **Source** را روی **GitHub Actions** قرار بده.
3. صفحه را ذخیره کن (اگر GitHub دکمه Save نشان می‌دهد).
4. وارد https://github.com/babakbinesh23/smart-energy-city/actions/workflows/pages.yml شو.
5. اگر اجرای خودکار قبلی Failed بود، از **Run workflow** روی شاخه `main` استفاده کن.
6. بعد از سبزشدن نتیجه، آدرس Demo target را باز کن و تغییر اسلایدرها و محیط WebGL را بررسی کن.

اگر گزینه Pages یا اجرای GitHub Actions قابل انتخاب نبود، باید مجوزهای حساب و تنظیمات مخزن بررسی شود.

## تغییرات آینده

با هر Push به `main`، workflow مجدداً تست، Build و Deploy را اجرا می‌کند.

## چک‌لیست صحت دمو

- [ ] صفحه فارسی باز می‌شود
- [ ] شهر سه‌بعدی رندر می‌شود
- [ ] حرکت دوربین و انتخاب مناطق کار می‌کند
- [ ] مقادیر محاسبه‌گر با تغییر اسلایدر به‌روز می‌شود
- [ ] کنسول مرورگر خطای جدی مربوط به Asset ندارد
