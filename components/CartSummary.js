import StripeCheckout from 'react-stripe-checkout'
import { Button, Segment, Divider } from 'semantic-ui-react'

export default ({
  shippingCharges,
  shippingPricesLoaded,
  handleCheckout,
  display_price: {
    with_tax: { amount, currency, formatted }
  }
}) => ( 
  <React.Fragment>
    <Divider />
    <Segment clearing size="large">
      <strong>Sub total:</strong> {formatted} + ${shippingCharges} (for shipping) = ${amount/100+(shippingCharges)}
      <StripeCheckout
        name="Billing Address"
        amount={amount+(shippingCharges*100)}
        currency={currency}
        stripeKey={process.env.STRIPE_PUBLISHABLE_KEY}
        shippingAddress={false}
        billingAddress={true}
        zipCode={true}
        token={handleCheckout}
        reconfigureOnUpdate={false}
        triggerEvent="onClick"
        country="India"
      >
        <Button color="black" floated="right" disabled={!shippingPricesLoaded}>
          Check out
        </Button>
      </StripeCheckout>
    </Segment>
  </React.Fragment>
)
