import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Admin 클라이언트 (서비스 롤 키 사용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  await updateUserSubscription(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: 'free',
      subscription_expires_at: null,
      stripe_subscription_id: null,
    })
    .eq('id', userId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // 결제 성공 로깅 또는 이메일 발송
  console.log('Invoice paid:', invoice.id);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  // 결제 실패 알림
  console.log('Invoice failed:', invoice.id);
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  // 플랜 결정 (가격 ID 기반)
  const priceId = subscription.items.data[0]?.price.id;
  let tier: 'free' | 'premium' | 'premium_plus' = 'free';

  if (priceId?.includes('premium_plus')) {
    tier = 'premium_plus';
  } else if (priceId?.includes('premium')) {
    tier = 'premium';
  }

  // 구독 상태 확인
  const isActive = ['active', 'trialing'].includes(subscription.status);

  await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: isActive ? tier : 'free',
      subscription_expires_at: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', userId);
}
