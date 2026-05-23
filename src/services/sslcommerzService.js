import axios from "axios";
import qs from "qs";

const SSL_BASE_URL =
  "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

const VALIDATION_URL =
  "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

export const initPayment = async (orderData) => {
  try {
    const {
      total_amount,
      currency = "BDT",
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      cus_name,
      cus_email,
      cus_phone,
      product_name,
    } = orderData;

    const store_id = process.env.SSLC_STORE_ID;
    const store_passwd = process.env.SSLC_STORE_PASSWD;

    console.log("🟢 STORE CHECK:", { store_id, store_passwd });

    const payload = {
      store_id,
      store_passwd,

      total_amount: Number(total_amount),
      currency,
      tran_id,

      success_url,
      fail_url,
      cancel_url,

      // CUSTOMER INFO
      cus_name,
      cus_email,
      cus_phone,

      // REQUIRED FIX (IMPORTANT)
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1200",
      cus_country: "Bangladesh",

      // SHIPPING
      shipping_method: "NO",
      num_of_item: 1,

      // PRODUCT INFO
      product_name,
      product_category: "Education",
      product_profile: "general",
      product_amount: Number(total_amount),
    };

    console.log("🟢 SSL REQUEST:", payload);

    const response = await axios.post(
      SSL_BASE_URL,
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 20000,
      }
    );

    console.log("🟢 SSL RESPONSE:", response.data);

    const data = response.data;

    if (!data || data.status === "FAILED") {
      console.error("❌ SSL FULL RESPONSE:", data);
      throw new Error(data?.failedreason || "SSL rejected request");
    }

    if (!data.GatewayPageURL) {
      throw new Error("GatewayPageURL missing");
    }

    return data;

  } catch (err) {
    console.error("❌ INIT PAYMENT ERROR:", err.message);
    throw new Error("Payment initialization failed");
  }
};

export const validatePayment = async (val_id) => {
  try {
    const res = await axios.get(VALIDATION_URL, {
      params: {
        val_id,
        store_id: process.env.SSLC_STORE_ID,
        store_passwd: process.env.SSLC_STORE_PASSWD,
        format: "json",
      },
    });

    return res.data;
  } catch (err) {
    console.error("VALIDATION ERROR:", err.message);
    return null;
  }
};