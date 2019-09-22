import Layout from '../components/Layout'
import CartItemList from '../components/CartItemList'
import CartSummary from '../components/CartSummary'
import ShippingSummary from '../components/ShippingSummary'


import {
  getCartItems,
  removeFromCart,
  checkoutCart,
  payForOrder
} from '../lib/moltin'

export default class Cart extends React.Component {
  state = {
    items: [],
    loading: true,
    completed: false,
    optimizedPacking: '',
    selectedCountry : '',
    getPricesButtonDisabled : true,
    deliveryDetails: [],
    shippingButtonActive : '',
    shippingCharges: 0.00,
    countrySelected : false,
    packingPictures : [],
    addressEmpty : true
  }



  async componentDidMount() {
    const cartId = await localStorage.getItem('mcart')
    const { data, meta } = await getCartItems(cartId)

    this.setState({
      items: data,
      meta,
      cartId,
      loading: false
    })
  }

  _handleCheckout = async data => {
    const cartId = await localStorage.getItem('mcart')
    const customerId = localStorage.getItem('mcustomer')

    const {
      id: token,
      email,
      card: {
        name,
        address_line1: line_1,
        address_city: city,
        address_country: country,
        address_state: county,
        address_zip: postcode
      }
    } = data

    const customer = customerId ? customerId : { name, email }

    const address = {
      first_name: name.split(' ')[0],
      last_name: name.split(' ')[1],
      line_1,
      city,
      county,
      country,
      postcode
    }

    try {
      const {
        data: { id }
      } = await checkoutCart(cartId, customer, address)
      await payForOrder(id, token, email)

      this.setState({
        completed: true
      })
    } catch (e) {
      console.log(e)
    }
  }

  

  _handleShipping = async data => {

    const productSpecs = {
      // in grams
        "001" : {
          "name": "Brown Watch",
          "weight" : 500,
          "w" : 50,
          "h" : 50,
          "d" : 40
        },
        "002" : {
          "name" : "Black Watch",
          "weight" : 400,
          "w" : 40,
          "h" : 40,
          "d" : 40
        },
       "003" : {
         "name" : "Chair",
         "weight" : 2000,
         "w" : 82,
         "h" : 101,
         "d" : 96
       },
       "004" : {
        "name" : "Toy Car",
        "weight" : 200,
        "w" : 5,
        "h" : 15,
        "d" : 15
      },
       "005" : {
         "name" : "Cotton Mat",
         "weight" : 1000,
         "w" : 10,
         "h" : 30,
         "d" : 30
       }
      }

    //construct GET request URL
    var url = 'https://intelliship-server.glitch.me/getOptimizedPacking?'

    var urlParams = ''
    this.state.items.forEach((element) => {
      urlParams += element.sku + '=' + element.quantity + '&'
    })
    url = url + urlParams

    //Optimizer API
    const optimizerResponse = await fetch(url);
    var optimizedPacking = await optimizerResponse.json();

    console.log(optimizedPacking)

    // Weight Calculator
    var grossWeight = 0
    var volumetricWeight = 0;

  
    // Calculate Product Weight
    this.state.items.forEach((element) => {
      grossWeight += productSpecs[element.sku].weight * element.quantity
    })

    var packingData = optimizedPacking.response.bins_packed[0].bin_data

    volumetricWeight = (packingData.w * packingData.h * packingData.d)/5000

    var finalWeight = (volumetricWeight > grossWeight) ? volumetricWeight : grossWeight
    finalWeight = finalWeight/1000 //convert to Kilograms


    // make call to Rules Engine API

    var rulesEngineURL = 'http://localhost:8080/delivery/getMoney?'
    rulesEngineURL += 'area='+this.state.selectedCountry+'&weight='+finalWeight

    var rulesEngineResponse = await fetch(rulesEngineURL);
    var rulesEngineResponse = await rulesEngineResponse.json();

    console.log(rulesEngineResponse)

    this.state.packingPictures =  [
      { 
        img: optimizedPacking.response.bins_packed[0].image_complete,
        name: 'Final Packing',
        dimensions : optimizedPacking.response.bins_packed[0].bin_data.d + 'x' +
                     optimizedPacking.response.bins_packed[0].bin_data.h + 'x' +
                     optimizedPacking.response.bins_packed[0].bin_data.w 

      },
    ]

    optimizedPacking.response.bins_packed[0].items.forEach((item) => {
      this.state.packingPictures.push({
        name: productSpecs[item.id].name,
        img: item.image_separated,
        dimensions: item.d + 'x' + item.w + 'x' + item.h 

      })
    })


    this.setState({
      deliveryDetails : rulesEngineResponse,
      countrySelected: true
    })


  }


  _handleRemoveFromCart = async itemId => {
    const { items, cartId } = this.state
    const { data, meta } = await removeFromCart(itemId, cartId)

    this.setState({
      countrySelected: false,
      items: data,
      meta
    })
  }

  handleChange = (e, { value }) => {
    this.setState({ 
      selectedCountry: value,
      getPricesButtonDisabled : false,
      countrySelected: false
    })
    
  }

  _shippingButtonHandle = (event, element) => {
    this.setState(
      { 
        shippingButtonActive: element.value,
        shippingCharges: element.price,
        enableCheckout : true
      }
      )
  }


  render() {
    const { meta, ...rest } = this.state
    const { loading } = rest

    var countryOptions = [
      { key: 'af', value: 'Afghanistan', flag: 'af', text: 'Afghanistan' },
      { key: 'al', value: 'Albania', flag: 'al', text: 'Albania' },
      { key: 'dz', value: 'Algeria', flag: 'dz', text: 'Algeria' },
      { key: 'as', value: 'American Samoa', flag: 'as', text: 'American Samoa' },
      { key: 'ad', value: 'Andorra', flag: 'ad', text: 'Andorra' },
      { key: 'ao', value: 'Angola', flag: 'ao', text: 'Angola' },
      { key: 'ai', value: 'Anguilla', flag: 'ai', text: 'Anguilla' },
      { key: 'ar', value: 'Argentina', flag: 'ar', text: 'Argentina' },
      { key: 'am', value: 'Armenia', flag: 'am', text: 'Armenia' },
      { key: 'au', value: 'Australia', flag: 'au', text: 'Australia' },
      { key: 'at', value: 'Austria', flag: 'at', text: 'Austria' },
      { key: 'az', value: 'Azerbaijan', flag: 'az', text: 'Azerbaijan' },
      { key: 'bh', value: 'Bahrain', flag: 'bh', text: 'Bahrain' },
      { key: 'bd', value: 'Bangladesh', flag: 'bd', text: 'Bangladesh' },
      { key: 'bb', value: 'Barbados', flag: 'bb', text: 'Barbados' },
      { key: 'by', value: 'Belarus', flag: 'by', text: 'Belarus' },
      { key: 'be', value: 'Belgium', flag: 'be', text: 'Belgium' },
      { key: 'bz', value: 'Belize', flag: 'bz', text: 'Belize' },
      { key: 'bj', value: 'Benin', flag: 'bj', text: 'Benin' },
      { key: 'bm', value: 'Bermuda', flag: 'bm', text: 'Bermuda' },
      { key: 'bt', value: 'Bhutan', flag: 'bt', text: 'Bhutan' },
      { key: 'ba', value: 'Bosnia and Herzegovina', flag: 'ba', text: 'Bosnia and Herzegovina' },
      { key: 'bw', value: 'Botswana', flag: 'bw', text: 'Botswana' },
      { key: 'br', value: 'Brazil', flag: 'br', text: 'Brazil' },
      { key: 'bg', value: 'Bulgaria', flag: 'bg', text: 'Bulgaria' },
      { key: 'bf', value: 'Burkina Faso', flag: 'bf', text: 'Burkina Faso' },
      { key: 'bi', value: 'Burundi', flag: 'bi', text: 'Burundi' },
      { key: 'kh', value: 'Cambodia', flag: 'kh', text: 'Cambodia' },
      { key: 'cm', value: 'Cameroon', flag: 'cm', text: 'Cameroon' },
      { key: 'ca', value: 'Canada', flag: 'ca', text: 'Canada' },
      { key: 'td', value: 'Chad', flag: 'td', text: 'Chad' },
      { key: 'cl', value: 'Chile', flag: 'cl', text: 'Chile' },
      { key: 'co', value: 'Colombia', flag: 'co', text: 'Colombia' },
      { key: 'cr', value: 'Costa Rica', flag: 'cr', text: 'Costa Rica' },
      { key: 'hr', value: 'Croatia', flag: 'hr', text: 'Croatia' },
      { key: 'cu', value: 'Cuba', flag: 'cu', text: 'Cuba' },
      { key: 'cy', value: 'Cyprus', flag: 'cy', text: 'Cyprus' },
      { key: 'dk', value: 'Denmark', flag: 'dk', text: 'Denmark' },
      { key: 'dj', value: 'Djibouti', flag: 'dj', text: 'Djibouti' },
      { key: 'dm', value: 'Dominica', flag: 'dm', text: 'Dominica' },
      { key: 'ec', value: 'Ecuador', flag: 'ec', text: 'Ecuador' },
      { key: 'eg', value: 'Egypt', flag: 'eg', text: 'Egypt' },
      { key: 'sv', value: 'El Salvador', flag: 'sv', text: 'El Salvador' },
      { key: 'er', value: 'Eritrea', flag: 'er', text: 'Eritrea' },
      { key: 'ee', value: 'Estonia', flag: 'ee', text: 'Estonia' },
      { key: 'et', value: 'Ethiopia', flag: 'et', text: 'Ethiopia' },
      { key: 'fj', value: 'Fiji', flag: 'fj', text: 'Fiji' },
      { key: 'fi', value: 'Finland', flag: 'fi', text: 'Finland' },
      { key: 'fr', value: 'France', flag: 'fr', text: 'France' },
      { key: 'ga', value: 'Gabon', flag: 'ga', text: 'Gabon' },
      { key: 'ge', value: 'Georgia', flag: 'ge', text: 'Georgia' },
      { key: 'de', value: 'Germany', flag: 'de', text: 'Germany' },
      { key: 'gh', value: 'Ghana', flag: 'gh', text: 'Ghana' },
      { key: 'gi', value: 'Gibraltar', flag: 'gi', text: 'Gibraltar' },
      { key: 'gr', value: 'Greece', flag: 'gr', text: 'Greece' },
      { key: 'gl', value: 'Greenland', flag: 'gl', text: 'Greenland' },
      { key: 'gd', value: 'Grenada', flag: 'gd', text: 'Grenada' },
      { key: 'gp', value: 'Guadeloupe', flag: 'gp', text: 'Guadeloupe' },
      { key: 'gu', value: 'Guam', flag: 'gu', text: 'Guam' },
      { key: 'gt', value: 'Guatemala', flag: 'gt', text: 'Guatemala' },
      { key: 'gw', value: 'Guinea-Bissau', flag: 'gw', text: 'Guinea-Bissau' },
      { key: 'ht', value: 'Haiti', flag: 'ht', text: 'Haiti' },
      { key: 'hn', value: 'Honduras', flag: 'hn', text: 'Honduras' },
      { key: 'hk', value: 'Hong Kong', flag: 'hk', text: 'Hong Kong' },
      { key: 'hu', value: 'Hungary', flag: 'hu', text: 'Hungary' },
      { key: 'is', value: 'Iceland', flag: 'is', text: 'Iceland' },
      { key: 'in', value: 'India', flag: 'in', text: 'India' },
      { key: 'id', value: 'Indonesia', flag: 'id', text: 'Indonesia' },
      { key: 'iq', value: 'Iraq', flag: 'iq', text: 'Iraq' },
      { key: 'il', value: 'Israel', flag: 'il', text: 'Israel' },
      { key: 'it', value: 'Italy', flag: 'it', text: 'Italy' },
      { key: 'jm', value: 'Jamaica', flag: 'jm', text: 'Jamaica' },
      { key: 'jp', value: 'Japan', flag: 'jp', text: 'Japan' },
      { key: 'jo', value: 'Jordan', flag: 'jo', text: 'Jordan' },
      { key: 'kz', value: 'Kazakhstan', flag: 'kz', text: 'Kazakhstan' },
      { key: 'ke', value: 'Kenya', flag: 'ke', text: 'Kenya' },
      { key: 'ki', value: 'Kiribati', flag: 'ki', text: 'Kiribati' },
      { key: 'kw', value: 'Kuwait', flag: 'kw', text: 'Kuwait' },
      { key: 'kg', value: 'Kyrgyzstan', flag: 'kg', text: 'Kyrgyzstan' },
      { key: 'lv', value: 'Latvia', flag: 'lv', text: 'Latvia' },
      { key: 'lb', value: 'Lebanon', flag: 'lb', text: 'Lebanon' },
      { key: 'ls', value: 'Lesotho', flag: 'ls', text: 'Lesotho' },
      { key: 'lr', value: 'Liberia', flag: 'lr', text: 'Liberia' },
      { key: 'ly', value: 'Libya', flag: 'ly', text: 'Libya' },
      { key: 'li', value: 'Liechtenstein', flag: 'li', text: 'Liechtenstein' },
      { key: 'lt', value: 'Lithuania', flag: 'lt', text: 'Lithuania' },
      { key: 'lu', value: 'Luxembourg', flag: 'lu', text: 'Luxembourg' },
      { key: 'mg', value: 'Madagascar', flag: 'mg', text: 'Madagascar' },
      { key: 'mw', value: 'Malawi', flag: 'mw', text: 'Malawi' },
      { key: 'my', value: 'Malaysia', flag: 'my', text: 'Malaysia' },
      { key: 'mv', value: 'Maldives', flag: 'mv', text: 'Maldives' },
      { key: 'ml', value: 'Mali', flag: 'ml', text: 'Mali' },
      { key: 'mt', value: 'Malta', flag: 'mt', text: 'Malta' },
      { key: 'mq', value: 'Martinique', flag: 'mq', text: 'Martinique' },
      { key: 'mr', value: 'Mauritania', flag: 'mr', text: 'Mauritania' },
      { key: 'mu', value: 'Mauritius', flag: 'mu', text: 'Mauritius' },
      { key: 'yt', value: 'Mayotte', flag: 'yt', text: 'Mayotte' },
      { key: 'mx', value: 'Mexico', flag: 'mx', text: 'Mexico' },
      { key: 'mc', value: 'Monaco', flag: 'mc', text: 'Monaco' },
      { key: 'mn', value: 'Mongolia', flag: 'mn', text: 'Mongolia' },
      { key: 'ms', value: 'Montserrat', flag: 'ms', text: 'Montserrat' },
      { key: 'ma', value: 'Morocco', flag: 'ma', text: 'Morocco' },
      { key: 'mz', value: 'Mozambique', flag: 'mz', text: 'Mozambique' },
      { key: 'mm', value: 'Myanmar', flag: 'mm', text: 'Myanmar' },
      { key: 'np', value: 'Nepal', flag: 'np', text: 'Nepal' },
      { key: 'nc', value: 'New Caledonia', flag: 'nc', text: 'New Caledonia' },
      { key: 'nz', value: 'New Zealand', flag: 'nz', text: 'New Zealand' },
      { key: 'ni', value: 'Nicaragua', flag: 'ni', text: 'Nicaragua' },
      { key: 'ng', value: 'Nigeria', flag: 'ng', text: 'Nigeria' },
      { key: 'nu', value: 'Niue', flag: 'nu', text: 'Niue' },
      { key: 'no', value: 'Norway', flag: 'no', text: 'Norway' },
      { key: 'om', value: 'Oman', flag: 'om', text: 'Oman' },
      { key: 'pk', value: 'Pakistan', flag: 'pk', text: 'Pakistan' },
      { key: 'pw', value: 'Palau', flag: 'pw', text: 'Palau' },
      { key: 'pa', value: 'Panama', flag: 'pa', text: 'Panama' },
      { key: 'pg', value: 'Papua New Guinea', flag: 'pg', text: 'Papua New Guinea' },
      { key: 'py', value: 'Paraguay', flag: 'py', text: 'Paraguay' },
      { key: 'pe', value: 'Peru', flag: 'pe', text: 'Peru' },
      { key: 'pl', value: 'Poland', flag: 'pl', text: 'Poland' },
      { key: 'pt', value: 'Portugal', flag: 'pt', text: 'Portugal' },
      { key: 'pr', value: 'Puerto Rico', flag: 'pr', text: 'Puerto Rico' },
      { key: 'qa', value: 'Qatar', flag: 'qa', text: 'Qatar' },
      { key: 'ro', value: 'Romania', flag: 'ro', text: 'Romania' },
      { key: 'rw', value: 'Rwanda', flag: 'rw', text: 'Rwanda' },
      { key: 'ws', value: 'Samoa', flag: 'ws', text: 'Samoa' },
      { key: 'sm', value: 'San Marino', flag: 'sm', text: 'San Marino' },
      { key: 'st', value: 'Sao Tome and Principe', flag: 'st', text: 'Sao Tome and Principe' },
      { key: 'sa', value: 'Saudi Arabia', flag: 'sa', text: 'Saudi Arabia' },
      { key: 'sn', value: 'Senegal', flag: 'sn', text: 'Senegal' },
      { key: 'sc', value: 'Seychelles', flag: 'sc', text: 'Seychelles' },
      { key: 'sl', value: 'Sierra Leone', flag: 'sl', text: 'Sierra Leone' },
      { key: 'sg', value: 'Singapore', flag: 'sg', text: 'Singapore' },
      { key: 'sk', value: 'Slovakia', flag: 'sk', text: 'Slovakia' },
      { key: 'si', value: 'Slovenia', flag: 'si', text: 'Slovenia' },
      { key: 'sb', value: 'Solomon Islands', flag: 'sb', text: 'Solomon Islands' },
      { key: 'so', value: 'Somalia', flag: 'so', text: 'Somalia' },
      { key: 'za', value: 'South Africa', flag: 'za', text: 'South Africa' },
      { key: 'es', value: 'Spain', flag: 'es', text: 'Spain' },
      { key: 'lk', value: 'Sri Lanka', flag: 'lk', text: 'Sri Lanka' },
      { key: 'sr', value: 'Suriname', flag: 'sr', text: 'Suriname' },
      { key: 'se', value: 'Sweden', flag: 'se', text: 'Sweden' },
      { key: 'ch', value: 'Switzerland', flag: 'ch', text: 'Switzerland' },
      { key: 'tj', value: 'Tajikistan', flag: 'tj', text: 'Tajikistan' },
      { key: 'th', value: 'Thailand', flag: 'th', text: 'Thailand' },
      { key: 'tl', value: 'Timor-Leste', flag: 'tl', text: 'Timor-Leste' },
      { key: 'tg', value: 'Togo', flag: 'tg', text: 'Togo' },
      { key: 'to', value: 'Tonga', flag: 'to', text: 'Tonga' },
      { key: 'tt', value: 'Trinidad and Tobago', flag: 'tt', text: 'Trinidad and Tobago' },
      { key: 'tn', value: 'Tunisia', flag: 'tn', text: 'Tunisia' },
      { key: 'tr', value: 'Turkey', flag: 'tr', text: 'Turkey' },
      { key: 'tm', value: 'Turkmenistan', flag: 'tm', text: 'Turkmenistan' },
      { key: 'tv', value: 'Tuvalu', flag: 'tv', text: 'Tuvalu' },
      { key: 'ug', value: 'Uganda', flag: 'ug', text: 'Uganda' },
      { key: 'ua', value: 'Ukraine', flag: 'ua', text: 'Ukraine' },
      { key: 'uy', value: 'Uruguay', flag: 'uy', text: 'Uruguay' },
      { key: 'uz', value: 'Uzbekistan', flag: 'uz', text: 'Uzbekistan' },
      { key: 'vu', value: 'Vanuatu', flag: 'vu', text: 'Vanuatu' },
      { key: 'vg', value: 'Virgin Islands (British)', flag: 'vg', text: 'Virgin Islands (British)' },
      { key: 'zm', value: 'Zambia', flag: 'zm', text: 'Zambia' },
      { key: 'zw', value: 'Zimbabwe', flag: 'zw', text: 'Zimbabwe' },
      { key: 'cn', value: 'China', flag: 'cn', text: 'China' },
      { key: 'ie', value: 'Ireland', flag: 'ie', text: 'Ireland' }
    ]

    var fromShipping = [{ key: 'sg', value: 'Singapore', flag: 'sg', text: 'Singapore' }]


    return (
      <Layout title="Cart">
        <CartItemList {...rest} removeFromCart={this._handleRemoveFromCart} />
        {!loading && !rest.completed && (
          <ShippingSummary {...meta} 
          handleShipping={this._handleShipping} 
          optimizedPacking={this.state.optimizedPacking}
          countries = {countryOptions}
          selectedCountry = {this.state.selectedCountry}
          handleChange = {this.handleChange}
          getPricesButtonDisabled = {this.state.getPricesButtonDisabled}
          deliveryDetails = {this.state.deliveryDetails}
          shippingButtonActive = {this.state.shippingButtonActive}
          shippingButtonHandle = {this._shippingButtonHandle}
          fromShipping = {fromShipping}
          countrySelected = {this.state.countrySelected}
          packingPictures = {this.state.packingPictures}
          />
        )}
        
        {!loading && !rest.completed && (
          <CartSummary {...meta} 
          handleCheckout={this._handleCheckout} 
          shippingCharges = {this.state.shippingCharges}
          shippingPricesLoaded = {this.state.shippingButtonActive}

          />
        )}

      </Layout>
    )
  }
}
