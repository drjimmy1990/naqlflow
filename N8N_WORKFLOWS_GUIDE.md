# Naqlflow v3 — دليل n8n Workflows الكامل + خطة الاختبار

> هذا الملف يحتوي على:
> 1. دليل بناء كل Workflow في n8n خطوة بخطوة
> 2. خطة اختبار المشروع الكاملة  
> 3. الخطوات القادمة حتى الإطلاق

---

## جدول المحتويات
1. [معلومات الاتصال بـ Supabase](#1-معلومات-supabase-لكل-workflow)
2. [Workflow 1: WhatsApp Order Ingestion](#workflow-1-whatsapp-order-ingestion)
3. [Workflow 2: Financial Check](#workflow-2-financial-check)
4. [Workflow 3: OTP Dispatch](#workflow-3-otp-dispatch)
5. [Workflow 4: Voice Collection](#workflow-4-voice-collection)
6. [Workflow 5: Document Expiry Alerts](#workflow-5-document-expiry-alerts)
7. [Workflow 6: Order Closed Report](#workflow-6-order-closed-report)
8. [خطة الاختبار الشاملة](#خطة-الاختبار-الشاملة)
9. [الخطوات القادمة](#الخطوات-القادمة-حتى-الإطلاق)

---

## 1. معلومات Supabase لكل Workflow

كل Workflow يحتاج **Supabase credential** في n8n. أنشئ credential واحد واستخدمه في الكل:

| Setting | Value |
|---------|-------|
| **Host** | `https://kalekptmrvbsowbzbngz.supabase.co` |
| **Service Role Key** | القيمة من `.env.local` → `SUPABASE_SERVICE_ROLE_KEY` |

### كيف تضيف Supabase في n8n
1. في n8n → **Settings → Credentials → Add Credential**
2. اختر **Header Auth** أو **HTTP Request** (حسب الطريقة)
3. أفضل طريقة: استخدم **HTTP Request** node مع هذه الإعدادات:
   - URL: `https://kalekptmrvbsowbzbngz.supabase.co/rest/v1/TABLE_NAME`
   - Headers:
     - `apikey`: قيمة `SUPABASE_SERVICE_ROLE_KEY`
     - `Authorization`: `Bearer [SUPABASE_SERVICE_ROLE_KEY]`
     - `Content-Type`: `application/json`
     - `Prefer`: `return=representation` (للـ INSERT/UPDATE)

---

## Workflow 1: WhatsApp Order Ingestion

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-whatsapp-order`

### الهدف
استقبال رسالة WhatsApp من عميل → تحليلها → إنشاء طلب جديد بحالة `draft`

### متى يتم تفعيله
يُستدعى من WhatsApp Business API (أو Twilio WhatsApp Sandbox) عند استقبال رسالة واردة

### خطوات البناء في n8n

```
[Webhook] → [Set Variables] → [AI Parse Message] → [Supabase: Find Client] → [IF Client Found] → [Supabase: Insert Order] → [Send WhatsApp Reply]
```

#### Node 1: Webhook (Trigger)
- **Method:** POST
- **Path:** `naqlflow-whatsapp-order`
- **Authentication:** None (أو Header Auth إذا تبيها آمنة)

**البيانات اللي تجي من WhatsApp API تكون بهذا الشكل:**
```json
{
  "from": "966551234567",
  "body": "طلب بنزين 91 - 36000 لتر - محطة ساسكو طريق الملك فهد",
  "timestamp": "2026-03-27T10:00:00Z"
}
```

#### Node 2: Set Variables
- `phone` = `{{ $json.from }}`
- `message` = `{{ $json.body }}`

#### Node 3: AI Parse (اختياري — يمكن استبداله بـ Split/Regex)
إذا عندك OpenAI أو Gemini في n8n:
- **System Prompt:**
```
أنت مساعد لتحليل رسائل طلبات الوقود. حلّل الرسالة واستخرج:
- fuel_type: (benzene_91, benzene_95, diesel, kerosene)  
- quantity: (الكمية بالتر)
- client_name: (اسم العميل أو المحطة)
- site_hint: (اسم الموقع إن وُجد)
أرجع JSON فقط.
```

**البديل بدون AI (Regex + Function):**
```javascript
// Function node
const msg = $input.first().json.message;
let fuel_type = 'benzene_91';
if (msg.includes('95')) fuel_type = 'benzene_95';
if (msg.includes('ديزل') || msg.includes('diesel')) fuel_type = 'diesel';

const qtyMatch = msg.match(/(\d{4,6})\s*(لتر|لتر|L)/);
const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 36000;

return [{ json: { fuel_type, quantity, raw: msg } }];
```

#### Node 4: Supabase — Find Client by phone
- **HTTP Request** → GET
- URL: `https://kalekptmrvbsowbzbngz.supabase.co/rest/v1/site_contacts?phone=eq.{{ $json.phone }}&select=site_id,name,client_sites(client_id,site_name,clients(id,name))`

#### Node 5: IF Client Found
- **Condition:** `{{ $json.length > 0 }}`
- **True:** → Continue to insert
- **False:** → Send "عميل غير معروف، تواصل مع الإدارة" reply

#### Node 6: Supabase — Insert Order
- **HTTP Request** → POST
- URL: `https://kalekptmrvbsowbzbngz.supabase.co/rest/v1/orders`
- Body:
```json
{
  "order_number": "ORD-2026-{{ Date.now().toString().slice(-5) }}",
  "source": "whatsapp",
  "status": "draft",
  "client_id": "{{ client_id from step 4 }}",
  "site_id": "{{ site_id from step 4 }}",
  "fuel_type_id": "{{ lookup fuel_type_id }}",
  "quantity_liters": "{{ quantity }}",
  "payment_method": "bank_transfer"
}
```

#### Node 7: Send WhatsApp Reply
- استخدم **Twilio** node أو **HTTP Request** لـ WhatsApp Business API
- الرسالة: `✅ تم استلام طلبك رقم {{ order_number }} — {{ quantity }} لتر {{ fuel_type }}`

### كيف تختبرها
1. افتح الـ Webhook في n8n → انسخ الـ **Test URL**
2. أرسل POST request من Postman:
```json
POST https://n8n.asra3.com/webhook-test/naqlflow-whatsapp-order
{
  "from": "0561111111",
  "body": "ابغى بنزين 91 - 36000 لتر - محطة ساسكو طريق الملك فهد"
}
```
3. تأكد إن طلب جديد ظهر في Dashboard → الطلبات

---

## Workflow 2: Financial Check

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-financial-check`

### الهدف
عند تحويل طلب لحالة `pending_financial`، يتم فحص الموقف المالي للعميل تلقائياً

### متى يتم تفعيله
يُستدعى من الداشبورد عند الضغط على زر "إرسال للمراجعة" (حالياً يدوي — لاحقاً نربطه تلقائي)

### خطوات البناء

```
[Webhook] → [Supabase: Get Order+Client] → [Supabase: Get Unpaid Orders] → [Calculate Balance] → [IF OK] → [Approve/Suspend]
```

#### Node 1: Webhook
- **Path:** `naqlflow-financial-check`
- **Input المتوقع:**
```json
{
  "order_id": "uuid-of-order",
  "client_id": "uuid-of-client"
}
```

#### Node 2: Get Order Details
- GET `https://...supabase.co/rest/v1/orders?id=eq.{{ $json.order_id }}&select=*,clients(name,is_active,bonus)`

#### Node 3: Get Unpaid Orders (الطلبات المعلقة للعميل)
- GET `https://...supabase.co/rest/v1/orders?client_id=eq.{{ client_id }}&status=in.(delivered,in_transit,delivering)&payment_method=eq.credit&select=total_price`
- **هذا يجيب كل الطلبات الآجلة اللي ما اتدفعت**

#### Node 4: Calculate (Function node)
```javascript
const unpaidOrders = $input.first().json;
const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
const creditLimit = 50000; // يمكن تخصيصها لكل عميل لاحقاً
const isApproved = totalUnpaid < creditLimit;

return [{
  json: {
    totalUnpaid,
    creditLimit,
    isApproved,
    reason: isApproved ? 'الموقف المالي سليم' : `تجاوز الحد الائتماني: ${totalUnpaid} ر.س`
  }
}];
```

#### Node 5: IF Approved
- **True →** Update order status to `financial_approved` + insert `order_log`
- **False →** Update order status to `suspended` + insert `order_log` with reason

#### Node 6: Update Order (HTTP Request)
- PATCH `https://...supabase.co/rest/v1/orders?id=eq.{{ order_id }}`
- Body: `{ "status": "financial_approved" }` أو `{ "status": "suspended", "financial_status_notes": "تجاوز الحد" }`

#### Node 7: Insert Order Log
- POST `https://...supabase.co/rest/v1/order_logs`
```json
{
  "order_id": "{{ order_id }}",
  "from_status": "pending_financial",
  "to_status": "{{ financial_approved OR suspended }}",
  "changed_by": "n8n-bot",
  "note": "{{ reason }}"
}
```

### كيف تختبرها
1. خذ `order_id` لطلب بحالة `pending_financial` من الـ seed data (ORD-2026-002)
2. أرسل POST:
```json
POST https://n8n.asra3.com/webhook-test/naqlflow-financial-check
{
  "order_id": "[UUID of ORD-2026-002]",
  "client_id": "[UUID of محطات الراجحي]"
}
```
3. تأكد إن الحالة تغيّرت في Dashboard

---

## Workflow 3: OTP Dispatch

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-otp-dispatch`

### الهدف
عند وصول السائق للمحطة وبدء التسليم → إرسال رمز OTP لمسؤول المحطة عبر SMS

### متى يتم تفعيله
يُستدعى عند تحويل الطلب لحالة `delivering`

### خطوات البناء

```
[Webhook] → [Supabase: Get Order+Site+Contact] → [Generate OTP] → [Send SMS] → [Supabase: Insert Delivery Proof]
```

#### Node 1: Webhook
- Input: `{ "order_id": "uuid" }`

#### Node 2: Get Order + Site Contact
- GET `https://...supabase.co/rest/v1/orders?id=eq.{{ order_id }}&select=*,client_sites(site_name,site_contacts(name,phone))`

#### Node 3: Generate OTP (Function)
```javascript
const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 أرقام
const contactPhone = $input.first().json.client_sites?.site_contacts?.[0]?.phone;
const contactName = $input.first().json.client_sites?.site_contacts?.[0]?.name;
return [{ json: { otp, contactPhone, contactName } }];
```

#### Node 4: Send SMS
- استخدم **Twilio SMS** node أو **HTTP Request** لأي SMS API:
  - To: `{{ contactPhone }}`
  - Message: `رمز تأكيد التسليم لطلب الوقود: {{ otp }} — NaqlFlow`

#### Node 5: Insert Delivery Proof
- POST `https://...supabase.co/rest/v1/delivery_proofs`
```json
{
  "order_id": "{{ order_id }}",
  "proof_type": "otp",
  "otp_code": "{{ otp }}"
}
```

### كيف تختبرها
1. خذ `order_id` لطلب بحالة `delivering` (ORD-2026-006)
2. أرسل POST مع الـ order_id
3. تأكد إن صف جديد ظهر في جدول `delivery_proofs`
4. SMS يوصل للرقم المسجّل (أو شوف log الـ Twilio)

---

## Workflow 4: Voice Collection

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-voice-collection`

### الهدف
عند ختم الطلب (sealed) + طريقة الدفع نقدي → إرسال مكالمة صوتية للسائق بمبلغ التحصيل

### متى يتم تفعيله
يُستدعى عند تحويل الطلب لحالة `sealed` **فقط إذا `payment_method = cash`**

### خطوات البناء

```
[Webhook] → [Supabase: Get Order+Driver+Price] → [IF Cash] → [Calculate Amount] → [Twilio Voice Call] → [Update cash_amount_due]
```

#### Node 1: Webhook
- Input: `{ "order_id": "uuid" }`

#### Node 2: Get Order + Driver + Price
- GET `https://...supabase.co/rest/v1/orders?id=eq.{{ order_id }}&select=*,drivers(name,phone),vehicles(tank_capacity_liters)`

#### Node 3: IF Cash
- Condition: `{{ $json.payment_method === 'cash' }}`
- **If NOT cash →** Stop (لا حاجة لمكالمة)

#### Node 4: Lookup Price (Function)
```javascript
const order = $input.first().json;
// Get price from price_lists
// Query: client_id + fuel_type_id + capacity = total_price
return [{ json: { 
  cashAmount: order.total_price || 0,
  driverPhone: order.drivers?.phone,
  driverName: order.drivers?.name
}}];
```

#### Node 5: Twilio Voice Call
- استخدم **Twilio** node:
  - To: `{{ driverPhone }}`
  - TwiML:
```xml
<Response>
  <Say language="ar-SA" voice="Polly.Zeina">
    السلام عليكم يا {{ driverName }}. 
    مبلغ التحصيل النقدي للطلب: {{ cashAmount }} ريال سعودي.
    يرجى التحصيل قبل التسليم.
  </Say>
</Response>
```

#### Node 6: Update Order
- PATCH `orders?id=eq.{{ order_id }}`
- Body: `{ "cash_amount_due": {{ cashAmount }} }`

### كيف تختبرها
1. أنشئ طلب جديد بدفع `cash` ووصّله لحالة `sealed`
2. أو خذ ORD-2026-005 (نقدي) وغيّر حالته لـ `sealed`
3. أرسل POST → تأكد إن المكالمة طلعت (Twilio logs)

---

## Workflow 5: Document Expiry Alerts

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-expiry-alerts`

### الهدف
فحص يومي للوثائق المنتهية أو القريبة من الانتهاء → إرسال تنبيه WhatsApp/SMS للمسؤول

### متى يتم تفعيله
- **تلقائي:** Schedule Trigger → كل يوم الساعة 8:00 صباحاً
- **يدوي:** عبر الـ Webhook URL

### خطوات البناء

```
[Schedule/Webhook] → [Supabase: Query Expiring Docs] → [Build Alert Message] → [Send WhatsApp]
```

#### Node 1: Trigger (Schedule + Webhook)
- أضف **Schedule Trigger** node: كل يوم 08:00 بتوقيت السعودية
- أضف **Webhook** node أيضاً: للتشغيل اليدوي
- وصّل الاثنين بنفس الـ Flow

#### Node 2: Query Expiring Driver Docs
- GET مع query معقد — استخدم **Supabase SQL** (أو عدة HTTP Requests):

```sql
-- سائقين بوثائق تنتهي خلال 30 يوم
SELECT name, phone, employee_number,
  national_id_expiry, license_expiry, aramco_card_expiry, transport_card_expiry
FROM drivers
WHERE is_active = true
  AND (
    national_id_expiry <= CURRENT_DATE + INTERVAL '30 days'
    OR license_expiry <= CURRENT_DATE + INTERVAL '30 days'
    OR aramco_card_expiry <= CURRENT_DATE + INTERVAL '30 days'
    OR transport_card_expiry <= CURRENT_DATE + INTERVAL '30 days'
  );
```

**في n8n:** استخدم **Supabase node** أو HTTP Request POST to:
`https://...supabase.co/rest/v1/rpc/get_expiring_docs`

**يجب إنشاء Function في Supabase SQL Editor:**
```sql
CREATE OR REPLACE FUNCTION get_expiring_docs()
RETURNS TABLE (
  entity_type TEXT, entity_name TEXT, phone TEXT,
  doc_name TEXT, expiry_date DATE, days_remaining INT
) AS $$
BEGIN
  -- السائقين
  RETURN QUERY
  SELECT 'driver'::TEXT, d.name, d.phone,
    unnest(ARRAY['الهوية','الرخصة','أرامكو','النقل'])::TEXT,
    unnest(ARRAY[d.national_id_expiry, d.license_expiry, d.aramco_card_expiry, d.transport_card_expiry]),
    (unnest(ARRAY[d.national_id_expiry, d.license_expiry, d.aramco_card_expiry, d.transport_card_expiry]) - CURRENT_DATE)::INT
  FROM drivers d WHERE d.is_active = true;

  -- الصهاريج
  RETURN QUERY
  SELECT 'vehicle'::TEXT, v.tanker_number, NULL::TEXT,
    unnest(ARRAY['الاستمارة','الفحص','التشغيل'])::TEXT,
    unnest(ARRAY[v.registration_expiry, v.inspection_expiry, v.operating_card_expiry]),
    (unnest(ARRAY[v.registration_expiry, v.inspection_expiry, v.operating_card_expiry]) - CURRENT_DATE)::INT
  FROM vehicles v WHERE v.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

#### Node 3: Filter (Function)
```javascript
const items = $input.all().map(i => i.json);
const alerts = items.filter(i => i.days_remaining !== null && i.days_remaining <= 30);
const expired = alerts.filter(i => i.days_remaining <= 0);
const warning = alerts.filter(i => i.days_remaining > 0 && i.days_remaining <= 30);

let message = '🔔 *تنبيه وثائق NaqlFlow*\n\n';

if (expired.length > 0) {
  message += '🔴 *منتهية:*\n';
  expired.forEach(a => {
    message += `• ${a.entity_type === 'driver' ? '👤' : '🚛'} ${a.entity_name} — ${a.doc_name} (منتهية ${Math.abs(a.days_remaining)} يوم)\n`;
  });
}

if (warning.length > 0) {
  message += '\n🟡 *قريبة الانتهاء:*\n';
  warning.forEach(a => {
    message += `• ${a.entity_type === 'driver' ? '👤' : '🚛'} ${a.entity_name} — ${a.doc_name} (${a.days_remaining} يوم)\n`;
  });
}

return [{ json: { message, alertCount: alerts.length } }];
```

#### Node 4: Send WhatsApp (إذا فيه تنبيهات)
- **IF** `alertCount > 0`
- أرسل لرقم المسؤول عبر WhatsApp Business API أو Twilio

### كيف تختبرها
1. البيانات التجريبية تحتوي سائقين بوثائق منتهية/قريبة (خالد الزهراني EMP-005 كلها منتهية)
2. شغّل الـ Webhook يدوياً من n8n
3. تأكد إن الرسالة تحتوي التنبيهات الصحيحة

---

## Workflow 6: Order Closed Report

**Webhook URL:** `https://n8n.asra3.com/webhook/naqlflow-order-closed`

### الهدف
عند إقفال الطلب → تجميع تقرير شامل → إرساله لإيميل العميل

### متى يتم تفعيله
يُستدعى عند تحويل الطلب لحالة `closed`

### خطوات البناء

```
[Webhook] → [Supabase: Get Full Order] → [Get Order Logs] → [Get Delivery Proofs] → [Build Report] → [Send Email]
```

#### Node 1: Webhook
- Input: `{ "order_id": "uuid" }`

#### Node 2: Get Full Order
- GET `orders?id=eq.{{ order_id }}&select=*,clients(name,commercial_name),client_sites(site_name,city),drivers(name,phone),vehicles(tanker_number,tank_capacity_liters),fuel_types(name)`

#### Node 3: Get Order Logs
- GET `order_logs?order_id=eq.{{ order_id }}&order=created_at.asc`

#### Node 4: Get Delivery Proofs
- GET `delivery_proofs?order_id=eq.{{ order_id }}`

#### Node 5: Build Report (Function)
```javascript
const order = $input.first().json;
const logs = /* from step 3 */;
const proofs = /* from step 4 */;

const report = `
📋 تقرير إقفال الطلب ${order.order_number}
━━━━━━━━━━━━━━━━━━━━━━━

👤 العميل: ${order.clients?.name}
📍 الموقع: ${order.client_sites?.site_name} — ${order.client_sites?.city}
🚛 الصهريج: ${order.vehicles?.tanker_number}
🧑‍✈️ السائق: ${order.drivers?.name}
⛽ الوقود: ${order.fuel_types?.name}
📊 الكمية: ${order.quantity_liters?.toLocaleString()} لتر
💰 السعر: ${order.total_price?.toLocaleString()} ر.س
💳 الدفع: ${order.payment_method}
⭐ تقييم السائق: ${order.driver_rating || 'لم يُقيّم'}/5

📝 سجل العمليات:
${logs.map(l => `  ${l.from_status} → ${l.to_status} (${l.changed_by}) — ${l.note || ''}`).join('\n')}

✅ الإثباتات:
${proofs.map(p => `  • ${p.proof_type}`).join('\n')}
`;

return [{ json: { report, clientEmail: /* from contacts */ } }];
```

#### Node 6: Send Email
- **Send Email** node أو SMTP:
  - To: إيميل العميل
  - Subject: `تقرير إقفال الطلب ${order.order_number} — NaqlFlow`
  - Body: التقرير

---

## ربط الـ Webhooks بالداشبورد (الخطوة التالية)

حالياً زر "تقدم الحالة" في `orders/page.tsx` يقوم بـ:
1. `INSERT INTO order_logs` (audit trail)  
2. `UPDATE orders SET status = nextStatus`

**المطلوب بعد الانتهاء من الـ Workflows:** إضافة `fetch()` calls لاستدعاء الـ webhooks المناسبة عند كل transition:

| Transition | Webhook يُستدعى |
|------------|----------------|
| `draft → pending_financial` | `naqlflow-financial-check` |
| `sealed → in_transit` + `cash` | `naqlflow-voice-collection` |
| `arrived → delivering` | `naqlflow-otp-dispatch` |
| `delivered → closed` | `naqlflow-order-closed` |

---

## خطة الاختبار الشاملة

### المرحلة 1: اختبار البيانات والواجهة ✅ (يمكن البدء الآن)

| الرقم | الاختبار | الخطوات | النتيجة المتوقعة |
|-------|----------|---------|-----------------|
| T-01 | تشغيل seed.sql | الصق محتوى `supabase/seed.sql` في SQL Editor → Run | 5 سائقين + 5 صهاريج + 4 عملاء + 8 مواقع + 16 سعر + 8 طلبات |
| T-02 | صفحة السائقين | افتح `/drivers` | 5 بطاقات سائقين + badges وثائق ملونة |
| T-03 | إضافة سائق | اضغط "+ إضافة سائق" → عبّي النموذج → حفظ | يظهر سائق جديد |
| T-04 | تعديل سائق | اضغط ✏️ على محمد العتيبي → غيّر الجوال → تحديث | الجوال يتحدث |
| T-05 | حذف سائق | اضغط 🗑️ على خالد الزهراني → تأكيد | يختفي |
| T-06 | صفحة الصهاريج | افتح `/vehicles` | 5 بطاقات بها اسم السائق المعيّن |
| T-07 | صفحة العملاء | افتح `/clients` | جدول 4 عملاء + عدد المواقع (3, 2, 2, 1) |
| T-08 | تفاصيل عميل | اضغط على "شركة ساسكو" | لوحة بها 3 مواقع + jhat اتصال + بنك الراجحي |
| T-09 | إضافة موقع | داخل التفاصيل → "+ إضافة موقع" | موقع جديد يظهر |
| T-10 | صفحة الطلبات | افتح `/orders` | 8 طلبات بفلاتر الحالة |
| T-11 | فلتر الحالة | اضغط على "مراجعة مالية" | يظهر طلب واحد (ORD-002) |
| T-12 | تقدم الحالة | اضغط "موافقة مالية" على ORD-002 | يتحول لـ "معتمد مالياً" |
| T-13 | إنشاء طلب | "+ طلب جديد" → ساسكو → محطة الملك فهد → بنزين 91 → 36000 → حفظ | طلب جديد بحالة "مسودة" |
| T-14 | صفحة الأسعار | افتح `/pricing` | 16 سعر مجمّعة (ساسكو 8, الراجحي 4, JPC 4) |
| T-15 | فلتر الوقود | اضغط "ديزل" | 3 أسعار فقط |
| T-16 | إضافة سعر | "+ إضافة سعر" → ساسكو → ديزل → 20K → 3000 ر.س | يظهر تحت ساسكو |
| T-17 | Dashboard KPIs | افتح `/` | أرقام حقيقية (8 طلبات, 4 عملاء, ...) |

### المرحلة 2: اختبار Workflows (بعد بناء كل workflow)

| الرقم | الاختبار | الخطوات | النتيجة |
|-------|----------|---------|---------|
| T-20 | WhatsApp Order | POST لـ webhook مع رسالة وقود | طلب جديد draft في الداشبورد |
| T-21 | Financial Check OK | POST order_id عميل برصيد سليم | الطلب يتحول لـ financial_approved |
| T-22 | Financial Check FAIL | POST order_id عميل متجاوز الحد | الطلب يتحول لـ suspended + سبب |
| T-23 | OTP Dispatch | POST order_id طلب delivering | SMS يوصل + صف جديد في delivery_proofs |
| T-24 | Voice Call | POST order_id طلب sealed + cash | مكالمة صوتية للسائق |
| T-25 | Expiry Alerts | شغّل الـ schedule trigger | رسالة فيها خالد الزهراني (وثائق منتهية) |
| T-26 | Close Report | POST order_id طلب → closed | إيميل تقرير للعميل |

### المرحلة 3: اختبار Full Lifecycle (بعد ربط الـ webhooks)

| رحلة الطلب الكاملة |
|---|
| 1. أنشئ طلب يدوي: ساسكو → محطة الملك فهد → بنزين 91 → 36K → **نقدي** |
| 2. اضغط "إرسال للمراجعة" → **يستدعي Financial Check webhook** → يوافق تلقائياً |
| 3. اضغط "تعميد الكميات" |
| 4. اضغط "أمر تحميل" → عيّن سائق محمد العتيبي + TK-101 |
| 5. اضغط "ختم وتشميع" → **يستدعي Voice Collection** → مكالمة لـ 0551234567 |
| 6. اضغط "بدء التوزيع" |
| 7. اضغط "وصل الموقع" |
| 8. اضغط "بدء التسليم" → **يستدعي OTP Dispatch** → SMS لأحمد الشمري 0561111111 |
| 9. اضغط "تأكيد التسليم" |
| 10. اضغط "إقفال" → **يستدعي Order Closed** → إيميل تقرير |
| **✅ تأكد:** 10 صفوف في `order_logs` + 2+ صفوف في `delivery_proofs` |

---

## الخطوات القادمة حتى الإطلاق

| # | المرحلة | الحالة | الوصف |
|---|---------|--------|-------|
| ✅ | Foundation | مكتمل | Next.js + Supabase schema + types + layout |
| ✅ | Dashboard CRUD | مكتمل | 5 صفحات CRUD كاملة |
| ✅ | Seed Data | مكتمل | بيانات تجريبية واقعية |
| 🔨 | n8n Workflows | **أنت هنا** | بناء الـ 6 workflows واحد واحد |
| ⬜ | ربط Webhooks بالداشبورد | بعد n8n | إضافة `fetch()` calls في `advanceStatus()` |
| ⬜ | Supabase Auth | بعد الربط | إضافة Login + RLS policies + roles |
| ⬜ | تطبيق السائق (PWA/Expo) | مؤجل | شاشة الطلبات + GPS + OTP + كاميرا |
| ⬜ | Deploy to VPS | أخيراً | aaPanel + Nginx + domain |
