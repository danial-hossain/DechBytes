<!-- sslcommerz-nodesdk -->
<!-- sslcommerz-js -->
<!-- @siamf/sslcommerz -->

<br/>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/logo/logo-white.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/logo/logo-black.png">
  <img alt="Siam Ahnaf" src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/logo/logo-black.png" height="auto" width="240">
</picture>
<br/> <br/>

# @siamf/sslcommerz
A well-maintained, unofficial Node.js package for integrating SSLCommerz payments. Provides reliable support for initiating and handling transactions with minimal setup.

## This is 100% secure and build with official docs. It doesn't contain any unwanted activity code and the full code is open source.

### Note: `@siamf/sslcommerz`, `sslcommerz-js`, `sslcommerz-nodesdk` all published from a single codebase, so you can use any of this 3 package

# Installation
```javascript
npm i @siamf/sslcommerz
pnpm i @siamf/sslcommerz
yarn add @siamf/sslcommerz
```

# Usage

### Initialize Package
```javascript
import { SslCommerz } from "@siamf/sslcommerz";

const store_id = "<store_id>"
const store_passwd = "<store_password>"
const is_live = false;
export const sslcz = new SslCommerz(store_id, store_passwd, is_live);
```

### Init the payment
```javascript
const data = {
    total_amount: 100,
    currency: 'EUR',
    tran_id: 'REF123',
    success_url: 'http://yoursite.com/success',
    fail_url: 'http://yoursite.com/fail',
    cancel_url: 'http://yoursite.com/cancel',
    ipn_url: 'http://yoursite.com/ipn',
    shipping_method: 'Courier',
    product_name: 'Computer.',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: 'cust@yahoo.com',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
    multi_card_name: 'mastercard',
    value_a: 'ref001_A',
    value_b: 'ref002_B',
    value_c: 'ref003_C',
    value_d: 'ref004_D'
};

const sslResponse = await sslcz.init(data);
```

### Validate the payment
```javascript
const data = {
    val_id:ADGAHHGDAKJ456454 //that you go from sslcommerz response
};

const sslResponse = await sslcz.validate(data)
```

### Initiate Refund
```javascript
const data = {
    refund_amount:10,
    refund_remarks: "",
    bank_tran_id: "CB5464321445456456",
    refe_id: "EASY5645415455"
};

const sslResponse = await sslcz.initiateRefund(data)
```

### Query the refund
```javascript
const data = {
    refund_ref_id: "SL4561445410"
};

const sslResponse = await sslcz.refundQuery(data)
```

### Query transaction by session ID
```javascript
const data = {
    sessionkey: "AKHLAKJS5456454"
};

const sslResponse = await sslcz.transactionQueryBySessionId(data);
```

### Query transaction by transaction ID
```javascript
const data = {
    tran_id: "AKHLAKJS5456454"
};

const sslResponse = await sslcz.transactionQueryByTransactionId(data);
```

### Suggestions, improvements, and pull requests are always welcome.

## Connect with me
<div style="display: flex; align-items: center; gap: 3px;">
<a href="https://wa.me/8801611994403"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/whatsapp.png" width="40" height="40"></a>
<a href="https://siamahnaf.com/" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/web.png" width="40" height="40"></a>
<a href="https://www.linkedin.com/in/siamahnaf/" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/linkedin.png" width="40" height="40"></a>
<a href="https://x.com/siamahnaf198" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/x.png" width="40" height="40"></a>
<a href="https://www.facebook.com/siamahnaf198/" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/facebook.png" width="40" height="40"></a>
<a href="https://t.me/siamahnaf198" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/telegram.png" width="40" height="40"></a>
<a href="https://www.npmjs.com/~siamahnaf" style="margin-right: 8px"><img src="https://raw.githubusercontent.com/siamahnaf/assets-kit/main/icons/npm.png" width="40" height="40"></a>
</div>