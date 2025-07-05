/**
 * Contact information constants for the contact page
 */

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  email: string;
  businessHours: {
    weekdays: string;
    saturday: string;
  };
  linkedinUrl: string;
}

export const CONTACT_INFO: ContactInfo = {
  address: {
    street: "501 North Capitol Avenue",
    city: "Indianapolis",
    state: "IN",
    zip: "46204",
  },
  email: "support@automatedconsultancy.com",
  businessHours: {
    weekdays: "Monday - Friday: 8am - 6pm",
    saturday: "Saturday: 10am - 4pm",
  },
  linkedinUrl: "https://www.linkedin.com/company/automated-consultancy-services/posts/?feedView=all",
}; 