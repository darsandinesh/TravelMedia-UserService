import Stripe from "stripe";
import dotenv from 'dotenv';
import { UserRepository } from "../../domain/repositories/userRepository";
dotenv.config()

if (!process.env.STRIPE_KEY) {
    console.log('Stripe API key is missing in the environment variables.');
}

const key = process.env.STRIPE_KEY || ''

const stripe = new Stripe(key);

export class PaymentService {

    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async createStripeSession(id: string) {
        try {
            console.log('Creating session for user with id:', id);

            // Create a Stripe Checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Travel Media',
                                images: ['https://thumbs.dreamstime.com/b/family-travel-lifestyle-father-hiking-child-mountain-adventures-norway-healthy-outdoor-active-vacations-dad-kid-together-307407296.jpg'],
                            },
                            unit_amount: 19900,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173`,
                metadata: {
                    userId: id,
                    amount: 199,
                },
            });

            console.log('Stripe session created successfully:', session);
            return {
                success: true,
                message: "Order successfully created",
                sessionId: session.id,
            };
        } catch (error) {
            console.error("Error in creating Stripe session:", error);
            return { success: false, message: "Failed to create order." };
        }
    }


    async orderSuccess(sessionId: string) {
        try {

            console.log(sessionId, '-----------id for the session');
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            console.log(session,'---------------session');

            if (session.payment_status === 'paid') {
                if (!session.metadata?.userId ) {
                    throw new Error("Missing required metadata in the session");
                }
                const data = {
                    userId: session.metadata.userId,
                    amount: session.metadata.amount,
                }
                const result = await this.userRepo.saveMembership(data)
                return result
            }
        } catch (error) {
            console.error("Error in creating Stripe session:", error);
            return { success: false, message: "Failed to create order." };
        }
    }
}
