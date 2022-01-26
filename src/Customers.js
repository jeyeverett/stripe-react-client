import { firestore, auth, googleAuthProvider } from "./lib/firebase";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function Customers() {
  const [user] = useAuthState(auth);
  console.log(user);

  return (
    <div className="flex flex-col items-center xl:w-1/2 mx-auto">
      <h1 className="text-4xl text-gray-700 font-semibold mb-8">Customers</h1>
      {user ? (
        <>
          <SaveCard user={user} />
          <SignOut user={user} />
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}

export function SaveCard({ user }) {
  const stripe = useStripe();
  const elements = useElements();
  const [setupIntent, setSetupIntent] = useState();
  const [wallet, setWallet] = useState([]);

  useEffect(() => {
    getWallet();
  }, [user]);

  const createSetupIntent = async (event) => {
    const intent = await fetchFromAPI("wallet");
    setSetupIntent(intent);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cardElement = elements.getElement(CardElement);

    // confirm card setup
    const { setupIntent: updatedSetupIntent, error } =
      await stripe.confirmCardSetup(setupIntent.client_secret, {
        payment_method: { card: cardElement },
      });

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      setSetupIntent(null);
      await getWallet();
      alert("Success! Card added to your wallet.");
    }
  };

  const getWallet = async () => {
    if (user) {
      try {
        const paymentMethods = await fetchFromAPI("wallet", { method: "GET" });
        setWallet(paymentMethods);
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (user) {
    return (
      <section className="w-full">
        <div className="mb-4 flex justify-center">
          <button
            onClick={createSetupIntent}
            hidden={setupIntent}
            className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center"
          >
            Add new credit card
          </button>
        </div>
        {setupIntent && (
          <>
            <div className="px-4 py-2 border border-gray-300 rounded mb-4">
              <h3 className="text-xl text-gray-700 font-medium mb-4 text-center">
                Submit a Payment Method
              </h3>
              <form onSubmit={handleSubmit}>
                <CardElement className="lg:w-3/4 mx-auto px-2 py-1 border border-gray-300 rounded-sm mb-4" />
                <button
                  type="submit"
                  className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center mx-auto"
                >
                  Add credit card
                </button>
              </form>
            </div>
          </>
        )}

        <div className="px-4 py-2 border border-gray-300 rounded my-4 flex flex-col items-center">
          <h3 className="text-xl text-gray-700 font-medium mb-4">
            Retrieve Payment Sources
          </h3>
          <select className="lg:w-3/4 px-2 py-1 border border-gray-300 rounded-sm">
            {wallet.map((paymentSource) => (
              <CreditCard card={paymentSource.card} key={paymentSource.id} />
            ))}
          </select>
        </div>
      </section>
    );
  } else {
    return (
      <div>
        <SignIn />
      </div>
    );
  }
}

function CreditCard(props) {
  const { last4, brand, exp_month, exp_year } = props.card;
  return (
    <option className="px-2 py-1 text-gray-700">
      {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
    </option>
  );
}

export function SignIn() {
  const signInWithGoogle = async () => {
    try {
      const {
        user: { uid, email },
      } = await auth.signInWithPopup(googleAuthProvider);
      firestore.collection("users").doc(uid).set({ email });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <button
      className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center"
      onClick={signInWithGoogle}
    >
      Sign in with Google
    </button>
  );
}

export function SignOut(props) {
  return (
    props.user && (
      <button
        className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm hover:bg-gray-300 transition-all flex items-center"
        onClick={() => auth.signOut()}
      >
        Sign out
      </button>
    )
  );
}
