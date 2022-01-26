import React, { useState, useEffect } from "react";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuthState } from "react-firebase-hooks/auth";

import { firestore, auth } from "./lib/firebase";
import { SignIn, SignOut } from "./Customers";

export default function Subscriptions() {
  const [user] = useAuthState(auth);

  return (
    <section className="py-8 flex flex-col items-center">
      {user ? (
        <div className="flex flex-col items-center">
          <SubscribeToPlan user={user} />
          <SignOut user={user} />
        </div>
      ) : (
        <SignIn />
      )}
    </section>
  );
}

function SubscribeToPlan({ user }) {
  const stripe = useStripe();
  const elements = useElements();

  const [plan, setPlan] = useState();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubscriptions();
  }, [user]);

  // fetch current subscriptions from API
  const getSubscriptions = async () => {
    if (user) {
      const subs = await fetchFromAPI("subscriptions", { method: "GET" });
      setSubscriptions(subs);
    }
  };

  // cancel a subscription
  const cancel = async (id) => {
    setLoading(true);
    await fetchFromAPI("subscriptions/" + id, { method: "PATCH" });
    alert("canceled");
    await getSubscriptions();
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    // create payment method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // create subscription on the server
    const subscription = await fetchFromAPI("subscriptions", {
      body: {
        plan,
        payment_method: paymentMethod.id,
      },
    });

    // the subscription contains an invoice
    // if the invoice's payment succeeded then you're good to go
    // otherwise, the payment intent must be confirmed
    const { latest_invoice } = subscription;

    if (latest_invoice.payment_intent) {
      const { client_secret, status } = latest_invoice.payment_intent;
      if (status === "requires_action") {
        const { error: confirmationError } = await stripe.confirmCardPayment(
          client_secret
        );

        if (confirmationError) {
          console.log(confirmationError);
          alert("Unable to confirm card");
          return;
        }
      }

      // sub success
      alert("You are subscribed");
      getSubscriptions();
    }
    setLoading(false);
    setPlan(null);
  };

  return (
    <>
      <div className="mb-8">{user.uid && <UserData user={user} />}</div>

      <hr />

      <div className="flex flex-col mb-8">
        <span className="flex mb-4">
          <button
            onClick={() => setPlan("price_1KMG0wDNsfgN88DjSgbINe1e")}
            className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center mr-4"
          >
            Choose Monthly $25/m
          </button>
          <button
            onClick={() => setPlan("price_1KMG1hDNsfgN88DjgxWyTe0y")}
            className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center"
          >
            Choose Quarterly $50/m
          </button>
        </span>

        <p className="text-gray-700">
          Selected plan: <strong className="text-sm">{plan}</strong>
        </p>
      </div>

      <hr />

      <form onSubmit={handleSubmit} hidden={!plan} className="w-full mb-8">
        <CardElement className="lg:w-3/4 mx-auto px-2 py-1 border border-gray-300 rounded-sm mb-4" />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center mx-auto"
        >
          Subscribe & Pay
        </button>
      </form>

      <div className="px-4 py-2 border border-gray-300 rounded mb-8">
        <h3 className="text-xl text-gray-700 font-medium mb-4 text-center">
          Manage Current Subscriptions
        </h3>
        {subscriptions.map((sub) => (
          <div key={sub.id}>
            {sub.id}. Next payment of {sub.items.data[0].unit_amount_decmial}
            {new Date(sub.current_period_end * 1000).toUTCString()}
            <button
              onClick={() => cancel(sub.id)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center mx-auto"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function UserData({ user }) {
  const [data, setData] = useState([]);
  // Subscribe to user's data in Firestore
  useEffect(() => {
    let unsubscribe;
    if (user) {
      const ref = firestore.collection("users").doc(user.id);
      unsubscribe = ref.onSnapshot((doc) => setData(doc.data()));
    }
    return unsubscribe;
  }, [user]);

  return data ? (
    <pre>
      Stripe Customer ID: {data.stripeCustomerId} <br />
      Subscriptions: {JSON.stringify(data.activePlans || [])}
    </pre>
  ) : (
    <p>No Stripe user data.</p>
  );
}
