import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { fetchFromAPI } from "./helpers";

export function Checkout() {
  const stripe = useStripe();
  const [product, setProduct] = useState({
    name: "T-shirt",
    description: "Organic cotton t-shirt",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80",
    ],
    amount: 5000, //cents not dollars
    currency: "usd",
    quantity: 0,
  });

  const handleCheckout = async (event) => {
    const body = { line_items: [product] };
    const { id: sessionId } = await fetchFromAPI("checkouts", {
      method: "POST",
      body,
    });

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.log(error);
    }
  };

  const changeQuantity = (qty) => {
    setProduct({ ...product, quantity: Math.max(0, product.quantity + qty) });
  };

  return (
    <>
      <div>
        <h3>{product.name}</h3>
        <h4>Stripe Amount: {product.amount}</h4>

        <img src={product.images[0]} width="250px" alt={product.description} />

        <button onClick={() => changeQuantity(-1)}>-</button>
        <span>{product.quantity}</span>
        <button onClick={() => changeQuantity(1)}>+</button>
      </div>

      <hr />

      <button onClick={handleCheckout} disabled={product.quantity < 1}>
        Start Checkout
      </button>
    </>
  );
}

export function CheckoutSuccess() {
  const url = window.location.href;
  const sessionId = new URL(url).searchParams.get("session_id");
  return <h3>Checkout was successful! {sessionId}</h3>;
}

// Only if user cancels - Stripe handles any errors in trying to make a payment
export function CheckoutFail() {
  return <h3>Checkout Failed@</h3>;
}
