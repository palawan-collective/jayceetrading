// Demo inquiries for the client presentation.
//
// The contact table only allows reads for a signed-in JayCee admin. While the
// admin sign-in is switched off, the Contacts tab and the lead pipeline fall
// back to this list so the panel still shows a working pipeline. As soon as a
// real session exists the live rows are used instead.

export type DemoLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  business_location: string | null;
  business_category: string | null;
  source_url: string | null;
  sales_stage: string;
  follow_up_notes: string;
  is_read: boolean;
  created_at: string;
};

const daysAgo = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

export const demoLeads: DemoLead[] = [
  {
    id: "demo-lead-01",
    name: "Carlo Manalo",
    email: "carlo.manalo@gmail.com",
    phone: "09175550101",
    message: "Hi, do you supply chicken breast in 20kg boxes for a restaurant in Port Barton? Please send your price list.",
    business_location: "Port Barton",
    business_category: "Restaurant",
    source_url: null,
    sales_stage: "quotation",
    follow_up_notes: "Sent the 20kg box rate. Waiting on their head count for December.",
    is_read: true,
    created_at: daysAgo(9, 9),
  },
  {
    id: "demo-lead-02",
    name: "Divina Cortez",
    email: "divina.cortez@yahoo.com",
    phone: "09185550102",
    message: "Looking for a weekly supplier of pork belly and ground pork for our canteen. Can you deliver to Sicsican?",
    business_location: "Sicsican",
    business_category: "Canteen",
    source_url: null,
    sales_stage: "qualified",
    follow_up_notes: "Confirmed we deliver to Sicsican on Tuesdays. Quotation to follow.",
    is_read: true,
    created_at: daysAgo(8, 14),
  },
  {
    id: "demo-lead-03",
    name: "Erwin Tolentino",
    email: "erwin.tolentino@gmail.com",
    phone: "09195550103",
    message: "Do you have blue cheese and mozzarella in stock this week? Need around 5kg for a hotel buffet.",
    business_location: "Puerto Princesa",
    business_category: "Hotel",
    source_url: null,
    sales_stage: "won",
    follow_up_notes: "Order placed for Friday delivery. Asked for a standing weekly order.",
    is_read: true,
    created_at: daysAgo(7, 10),
  },
  {
    id: "demo-lead-04",
    name: "Jessa Bautista",
    email: "jessa.bautista@gmail.com",
    phone: "09205550104",
    message: "Good day, asking for quotation for 50kg beef brisket and 30kg chicken thighs.",
    business_location: "Puerto Princesa",
    business_category: "Restaurant",
    source_url: null,
    sales_stage: "contacted",
    follow_up_notes: "Called back. Comparing our brisket price against their current supplier.",
    is_read: true,
    created_at: daysAgo(6, 16),
  },
  {
    id: "demo-lead-05",
    name: "Noli Dizon",
    email: "noli.dizon@outlook.com",
    phone: "09215550105",
    message: "Can I order online and pay via GCash then pick up the same day?",
    business_location: "Puerto Princesa",
    business_category: "Household",
    source_url: null,
    sales_stage: "won",
    follow_up_notes: "Walked them through online checkout. First order picked up same day.",
    is_read: true,
    created_at: daysAgo(5, 11),
  },
  {
    id: "demo-lead-06",
    name: "Rhea Salonga",
    email: "rhea.salonga@gmail.com",
    phone: "09225550106",
    message: "We are opening a small cafe and need a regular supplier. Do you offer credit terms for businesses?",
    business_location: "Puerto Princesa",
    business_category: "Cafe",
    source_url: null,
    sales_stage: "quotation",
    follow_up_notes: "Sent business account terms. Opening date is end of the month.",
    is_read: true,
    created_at: daysAgo(4, 13),
  },
  {
    id: "demo-lead-07",
    name: "Alvin Ponce",
    email: "alvin.ponce@gmail.com",
    phone: "09235550107",
    message: "Please advise if you deliver to San Vicente and what the minimum order is.",
    business_location: "San Vicente",
    business_category: "Resort",
    source_url: null,
    sales_stage: "qualified",
    follow_up_notes: "Minimum order explained. They will confirm volume after their booking season.",
    is_read: false,
    created_at: daysAgo(3, 15),
  },
  {
    id: "demo-lead-08",
    name: "Maricel Uy",
    email: "maricel.uy@gmail.com",
    phone: "09245550108",
    message: "Interested in your seafood specials for Friday. How fresh is the catch and where is it from?",
    business_location: "Puerto Princesa",
    business_category: "Seafood buyer",
    source_url: null,
    sales_stage: "contacted",
    follow_up_notes: "Explained the Friday catch schedule. Sending the specials sheet.",
    is_read: false,
    created_at: daysAgo(2, 10),
  },
  {
    id: "demo-lead-09",
    name: "Bong Arellano",
    email: "bong.arellano@gmail.com",
    phone: "09255550109",
    message: "Need 100 pcs eggs and 10kg sausages for an event on Saturday. Can you confirm availability?",
    business_location: "Puerto Princesa",
    business_category: "Events",
    source_url: null,
    sales_stage: "won",
    follow_up_notes: "Reserved stock for Saturday morning pickup.",
    is_read: false,
    created_at: daysAgo(1, 9),
  },
  {
    id: "demo-lead-10",
    name: "Tess Lacson",
    email: "tess.lacson@gmail.com",
    phone: "09265550110",
    message: "Do you have halal options? We cater to Muslim guests at our resort.",
    business_location: "El Nido",
    business_category: "Resort",
    source_url: null,
    sales_stage: "new",
    follow_up_notes: "",
    is_read: false,
    created_at: daysAgo(1, 17),
  },
  {
    id: "demo-lead-11",
    name: "Ferdie Lim",
    email: "ferdie.lim@gmail.com",
    phone: "09275550111",
    message: "Please send your latest product catalogue and delivery schedule for El Nido.",
    business_location: "El Nido",
    business_category: "Grocery",
    source_url: null,
    sales_stage: "new",
    follow_up_notes: "",
    is_read: false,
    created_at: daysAgo(0, 8),
  },
  {
    id: "demo-lead-12",
    name: "Karen Yap",
    email: "karen.yap@gmail.com",
    phone: "09285550112",
    message: "Hi, I would like to be a reseller of your frozen products in Roxas. Who can I talk to?",
    business_location: "Roxas",
    business_category: "Reseller",
    source_url: null,
    sales_stage: "new",
    follow_up_notes: "",
    is_read: false,
    created_at: daysAgo(0, 7),
  },
];
