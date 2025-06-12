const midtransClient = require('midtrans-client');

export default async ({ req, res, log, error }) => {
  // --- 1. VALIDATION ---
  // Ensure the request is a POST request.
  if (req.method !== 'POST') {
    return res.json({ ok: false, msg: 'Only POST requests are allowed.' }, 405);
  }

  // Check for necessary environment variables.
  // These are set in your Appwrite function's settings.
  if (
    !process.env.MIDTRANS_SERVER_KEY ||
    !process.env.MIDTRANS_CLIENT_KEY
  ) {
    error('Missing Midtrans environment variables. Please set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in your function settings.');
    return res.json({ ok: false, msg: 'Server configuration error.' }, 500);
  }

  // --- 2. INITIALIZE MIDTRANS CLIENT ---
  // Create a Snap API instance.
  // The 'isProduction' flag should be 'false' for sandbox and 'true' for the live environment.
  let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  });

  // --- 3. PARSE INCOMING DATA ---
  // The client (your React app) should send 'orderId' and 'amount' in the request body.
  let { amount } = JSON.parse(req.body);

  if (!orderId || !amount) {
    return res.json({ ok: false, msg: 'Missing orderId or amount in request body.' }, 400);
  }

  // A unique order ID is required for each transaction.
  // Here we append a timestamp to ensure uniqueness for this example.
  const orderId = `TRX-${Date.now()}`;

  // --- 4. DEFINE TRANSACTION PARAMETERS ---
  // This is the main object that will be sent to Midtrans.
  let parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
      currency: 'USD'
    }
  };

  log(`Creating Midtrans transaction for order: ${uniqueOrderId}`);

  // --- 5. CREATE TRANSACTION AND GET TOKEN ---
  try {
    const transaction = await snap.createTransaction(parameter);
    log(`Successfully created token: ${transaction.token}`);

    // --- 6. SEND TOKEN BACK TO CLIENT ---
    return res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (e) {
    // Log the detailed error from Midtrans for debugging.
    error('Midtrans API error:');
    error(e.ApiResponse ? e.ApiResponse.error_messages : e.message);

    return res.json({
      ok: false,
      msg: 'Failed to create Midtrans token.',
      error: e.message
    }, 500);
  }
}