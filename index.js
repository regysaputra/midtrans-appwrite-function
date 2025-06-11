const midtransClient = require('midtrans-client');

export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { amount } = JSON.parse(req.body);

    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const orderId = `TRX-${nanoid(4)}-${nanoid(8)}`

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
        currency: 'USD'
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
}