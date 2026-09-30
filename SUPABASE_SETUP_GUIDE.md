# Thiết lập PostgreSQL hosted (Supabase)

Hướng dẫn này dùng cho một PostgreSQL database do Supabase quản lý. Giao diện nhà cung cấp có thể thay đổi; hãy lấy connection URI hiện tại trực tiếp từ dashboard của project.

> Nếu credentials thật từng được commit, hãy rotate chúng ngay. Không commit `.env`, connection URI, JWT secret hoặc API key.

## 1. Chuẩn bị connection

Tạo project, đặt database password mạnh, rồi sao chép PostgreSQL connection URI do Supabase cung cấp. Nếu password có ký tự đặc biệt, dùng URI đã được URL-encode. Với ứng dụng triển khai dài hạn, dùng connection/pooler mode mà nhà cung cấp khuyến nghị cho runtime của bạn.

Trong PowerShell, chỉ đặt URI cho phiên terminal hiện tại:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Không ghi URI thật vào script trong repository.

## 2. Chạy migration an toàn

Cài PostgreSQL client để lệnh `psql` có trên `PATH`, sao lưu database, rồi chạy ordered forward-migration workflow:

```powershell
cd 02-database-postgresql
.\run-migration.bat
```

Hoặc:

```powershell
pwsh -NoProfile -File .\run-migration.ps1
```

Runner áp dụng các file additive trong `migrations/` theo thứ tự, lưu SHA-256 trong `schema_migrations`, dừng khi có lỗi và kiểm tra canonical schema sau cùng. Xem [RUN_MIGRATION.md](02-database-postgresql/RUN_MIGRATION.md) trước khi chạy trên database có dữ liệu.

`02-database-postgresql/linglooma_update.sql` là reset script dành riêng cho database phát triển mới. File này chạy `DROP TABLE ... CASCADE`; tuyệt đối không dùng để upgrade Supabase hoặc database đang có dữ liệu. Các file `reading_migration.sql` và `writing_migration.sql` cũng là thiết kế legacy đã bị khóa, không phải entry point.

Nếu `psql` chưa được cài, hãy cài PostgreSQL client thay vì copy reset SQL vào SQL Editor. Việc chạy từng migration thủ công sẽ bỏ qua migration ledger và hash verification.

## 3. Cấu hình backend

Sao chép environment template và điền secrets trong môi trường local/deployment:

```powershell
Copy-Item 01-backend-nodejs/.env.local.example 01-backend-nodejs/.env
```

Các biến chính:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=1d
GEMINI_API_KEY=your_own_key
AZURE_SPEECH_KEY=your_own_key
AZURE_SPEECH_REGION=your_region
PORT=3000
```

Khi `DATABASE_URL` tồn tại, backend ưu tiên nó hơn các biến `DB_*`. Kết nối hosted dùng TLS theo cấu hình trong `db.js`.

## 4. Kiểm tra

```powershell
cd 01-backend-nodejs
npm ci
npm test
npm start
```

Kiểm tra `GET /api/health`. Endpoint trả `200` khi database kết nối được và `503` khi không kết nối được; nó không trả chi tiết lỗi database.

Để kiểm tra schema read-only bằng cùng connection:

```powershell
cd 02-database-postgresql
psql -X -v ON_ERROR_STOP=1 -d $env:DATABASE_URL -f .\check-migration.sql
```

## 5. Triển khai

Đặt `DATABASE_URL`, `JWT_SECRET`, provider keys và `PORT=3000` trong secret manager của nền tảng triển khai. Build backend bằng `npm ci` và start bằng `npm start`. Không đưa secrets vào frontend hoặc biến `VITE_*`; các biến đó được đóng gói vào JavaScript gửi tới trình duyệt.

Chat, submission và history/detail APIs yêu cầu JWT. Test health trước, sau đó đăng ký/đăng nhập bằng tài khoản thử nghiệm do bạn tự tạo. Repository không cung cấp production credentials hay demo account mặc định qua forward migrations.

## Khắc phục sự cố

- `password authentication failed`: tạo lại password/URI và cập nhật secret manager; không in URI vào log.
- `relation ... does not exist`: chạy forward runner và đọc lỗi đầu tiên; không chạy reset SQL.
- `too many connections`: dùng pooler URI do provider cung cấp và kiểm tra giới hạn connection của project.
- Migration báo hash thay đổi: không sửa migration đã áp dụng; thêm migration mới. Khôi phục file cũ trước khi tiếp tục.
- Database chỉ có singular legacy tables: export và map dữ liệu trước; runner cố ý từ chối tự suy diễn migration.
