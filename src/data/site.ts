// Single source of truth for contact details, keys, links and legal copy.
export const site = {
  name: 'Young Savers PH',
  url: 'https://www.youngsaversph.com',
  advisor: 'Kreezel B. Villanueva',
  role: 'AIA Philippines Licensed Financial Advisor',
  phone: { display: '0916 535 4308', href: 'tel:+639165354308' },
  email: 'kreezel-b.villanueva@aia.com.ph',
  messenger: [
    { label: 'Message Young Savers PH', href: 'https://m.me/youngsaversph' },
    { label: 'Message Kreezel', href: 'https://m.me/kreezelvillanueva' },
  ],
  social: {
    facebook: 'https://www.facebook.com/youngsaversph',
    instagram: 'https://www.instagram.com/youngsaversph/',
  },
  calendlyUrl: 'https://calendly.com/kreezelvillanueva/online-assessment-with-kreezel-villanueva?hide_gdpr_banner=1',
  jotformId: '210720760397455',
  web3formsKey: '0f7978c6-3ba0-4802-85f6-5efd771c2922', // public by design
  calculatorUrl: 'https://www.aia.com.ph/en/financial-needs-calculator.html', // old philamlife.com URL 301s here
  products: [
    { slug: 'med-assist', name: 'AIA Med Assist' },
    { slug: 'critical-protect-100', name: 'AIA Critical Protect 100' },
    { slug: 'all-in-one', name: 'AIA All-In-One' },
  ],
  disclaimer:
    'This is not an official website of AIA Philippines or the AIA Group. Product information here is a general overview only and is not a policy contract. Benefits, coverage and terms are governed by the policy contract and may change. For official information, visit aia.com.ph.',
  privacyLine:
    'The details you share are used only to respond to your inquiry.',
} as const;
