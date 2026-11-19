// Service worker tối giản: chỉ để điện thoại Android cho phép "Cài đặt ứng dụng".
// Không lưu bộ nhớ đệm, mọi yêu cầu đi thẳng lên mạng như bình thường.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
