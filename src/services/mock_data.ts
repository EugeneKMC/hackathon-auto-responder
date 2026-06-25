// AUTO-GENERATED from hackathon_client_dataset xlsx — DO NOT EDIT BY HAND.

export type Client = {
  client_id: string;
  company_name: string;
  primary_contact: string;
  email: string;
  phone: string | null;
  preferred_channel: 'WhatsApp' | 'Zendesk' | 'Email';
  account_manager: string;
  client_since: string;
  contract_type: 'Monthly' | 'Annual';
  status: 'Active' | 'Inactive';
};

export type SeatRecord = {
  seat_record_id: string;
  client_id: string;
  company_name: string;
  total_seats: number;
  seats_occupied: number;
  seats_available: number;
  occupancy_pct: string;
  floor_zone: string;
  daily_rate_php: number;
  contract_start: string;
  contract_end: string;
  next_review_date: string;
  notes: string | null;
};

export type Invoice = {
  invoice_id: string;
  client_id: string;
  company_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount_php: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paid_date: string | null;
  days_overdue: number;
  billing_period: string;
  description: string;
};

export type ServiceRequest = {
  ticket_id: string;
  client_id: string;
  company_name: string;
  request_type:
    | 'Headcount Change'
    | 'Facilities'
    | 'IT Support'
    | 'Contract Query'
    | 'Access & Security'
    | 'Other';
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  submitted_date: string;
  assigned_to: string;
  resolved_date: string | null;
  days_open: number;
  client_notes: string | null;
};

export const CLIENTS: Client[] = [
  {
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "primary_contact": "Maria Santos",
    "email": "maria@nexuslogistics.ph",
    "phone": "+63 917 111 2233",
    "preferred_channel": "WhatsApp",
    "account_manager": "James Reyes",
    "client_since": "2023-07-14",
    "contract_type": "Monthly",
    "status": "Active"
  },
  {
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "primary_contact": "Kevin Tan",
    "email": "kevin@brightpathbpo.com",
    "phone": null,
    "preferred_channel": "Zendesk",
    "account_manager": "Ana Cruz",
    "client_since": "2025-04-03",
    "contract_type": "Annual",
    "status": "Active"
  },
  {
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "primary_contact": "Patricia Lim",
    "email": "plim@horizonretail.com",
    "phone": "+63 918 444 5566",
    "preferred_channel": "Email",
    "account_manager": "James Reyes",
    "client_since": "2024-07-21",
    "contract_type": "Monthly",
    "status": "Active"
  },
  {
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "primary_contact": "Ramon dela Cruz",
    "email": "ramon@aquacore.io",
    "phone": null,
    "preferred_channel": "Zendesk",
    "account_manager": "Ana Cruz",
    "client_since": "2024-09-12",
    "contract_type": "Monthly",
    "status": "Active"
  },
  {
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "primary_contact": "Elena Villanueva",
    "email": "elena@skybridgefinance.com",
    "phone": "+63 919 777 8899",
    "preferred_channel": "WhatsApp",
    "account_manager": "Mark Domingo",
    "client_since": "2023-04-05",
    "contract_type": "Monthly",
    "status": "Active"
  },
  {
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "primary_contact": "David Go",
    "email": "dgo@pinnaclepharma.com",
    "phone": null,
    "preferred_channel": "Zendesk",
    "account_manager": "Mark Domingo",
    "client_since": "2023-06-06",
    "contract_type": "Annual",
    "status": "Active"
  },
  {
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "primary_contact": "Rowena Bautista",
    "email": "rbautista@coastal.ph",
    "phone": "+63 920 222 3344",
    "preferred_channel": "Email",
    "account_manager": "James Reyes",
    "client_since": "2023-10-18",
    "contract_type": "Monthly",
    "status": "Active"
  },
  {
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "primary_contact": "Alicia Reyes",
    "email": "areyes@urbanedge.com",
    "phone": null,
    "preferred_channel": "Zendesk",
    "account_manager": "Ana Cruz",
    "client_since": "2023-09-02",
    "contract_type": "Annual",
    "status": "Active"
  }
];

export const SEATS: SeatRecord[] = [
  {
    "seat_record_id": "SEAT-CLT-001",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "total_seats": 10,
    "seats_occupied": 5,
    "seats_available": 5,
    "occupancy_pct": "50%",
    "floor_zone": "Floor 3 – Zone B",
    "daily_rate_php": 3500,
    "contract_start": "2025-10-18",
    "contract_end": "2026-11-20",
    "next_review_date": "2026-08-06",
    "notes": "On track — no issues"
  },
  {
    "seat_record_id": "SEAT-CLT-002",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "total_seats": 40,
    "seats_occupied": 40,
    "seats_available": 0,
    "occupancy_pct": "100%",
    "floor_zone": "Floor 4 – Zone B",
    "daily_rate_php": 16000,
    "contract_start": "2024-12-10",
    "contract_end": "2027-05-07",
    "next_review_date": "2026-07-30",
    "notes": "New hires onboarding next month"
  },
  {
    "seat_record_id": "SEAT-CLT-003",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "total_seats": 20,
    "seats_occupied": 10,
    "seats_available": 10,
    "occupancy_pct": "50%",
    "floor_zone": "Floor 4 – Zone B",
    "daily_rate_php": 9000,
    "contract_start": "2024-11-11",
    "contract_end": "2026-10-21",
    "next_review_date": "2026-07-19",
    "notes": "On track — no issues"
  },
  {
    "seat_record_id": "SEAT-CLT-004",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "total_seats": 15,
    "seats_occupied": 12,
    "seats_available": 3,
    "occupancy_pct": "80%",
    "floor_zone": "Floor 4 – Zone B",
    "daily_rate_php": 5250,
    "contract_start": "2025-10-13",
    "contract_end": "2026-09-17",
    "next_review_date": "2026-07-24",
    "notes": "Requested floor change under review"
  },
  {
    "seat_record_id": "SEAT-CLT-005",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "total_seats": 30,
    "seats_occupied": 23,
    "seats_available": 7,
    "occupancy_pct": "77%",
    "floor_zone": "Floor 4 – Zone B",
    "daily_rate_php": 10500,
    "contract_start": "2024-10-17",
    "contract_end": "2026-08-23",
    "next_review_date": "2026-08-30",
    "notes": "Contract renewal discussion due soon"
  },
  {
    "seat_record_id": "SEAT-CLT-006",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "total_seats": 10,
    "seats_occupied": 9,
    "seats_available": 1,
    "occupancy_pct": "90%",
    "floor_zone": "Floor 5 – Zone A",
    "daily_rate_php": 4000,
    "contract_start": "2025-07-07",
    "contract_end": "2027-02-02",
    "next_review_date": "2026-08-16",
    "notes": "Client expanding team next quarter"
  },
  {
    "seat_record_id": "SEAT-CLT-007",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "total_seats": 10,
    "seats_occupied": 10,
    "seats_available": 0,
    "occupancy_pct": "100%",
    "floor_zone": "Floor 3 – Zone A",
    "daily_rate_php": 4000,
    "contract_start": "2025-08-10",
    "contract_end": "2026-12-27",
    "next_review_date": "2026-08-26",
    "notes": "Client expanding team next quarter"
  },
  {
    "seat_record_id": "SEAT-CLT-008",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "total_seats": 25,
    "seats_occupied": 16,
    "seats_available": 9,
    "occupancy_pct": "64%",
    "floor_zone": "Floor 3 – Zone B",
    "daily_rate_php": 11250,
    "contract_start": "2025-04-16",
    "contract_end": "2027-02-03",
    "next_review_date": "2026-07-24",
    "notes": "On track — no issues"
  }
];

export const INVOICES: Invoice[] = [
  {
    "invoice_id": "INV-0001",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "invoice_number": "WS-2026-0001",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 80748,
    "status": "Paid",
    "paid_date": "2026-02-21",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0002",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "invoice_number": "WS-2026-0002",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 74339,
    "status": "Paid",
    "paid_date": "2026-03-23",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0003",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "invoice_number": "WS-2026-0003",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 77607,
    "status": "Paid",
    "paid_date": "2026-04-23",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0004",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "invoice_number": "WS-2026-0004",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 87147,
    "status": "Paid",
    "paid_date": "2026-05-30",
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0005",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "invoice_number": "WS-2026-0005",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 80845,
    "status": "Overdue",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0006",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "invoice_number": "WS-2026-0006",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 365250,
    "status": "Paid",
    "paid_date": "2026-02-21",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0007",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "invoice_number": "WS-2026-0007",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 357626,
    "status": "Paid",
    "paid_date": "2026-03-30",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0008",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "invoice_number": "WS-2026-0008",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 354505,
    "status": "Paid",
    "paid_date": "2026-05-02",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0009",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "invoice_number": "WS-2026-0009",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 360145,
    "status": "Paid",
    "paid_date": "2026-05-27",
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0010",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "invoice_number": "WS-2026-0010",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 349168,
    "status": "Overdue",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0011",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "invoice_number": "WS-2026-0011",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 211585,
    "status": "Paid",
    "paid_date": "2026-02-28",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0012",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "invoice_number": "WS-2026-0012",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 199967,
    "status": "Paid",
    "paid_date": "2026-03-28",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0013",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "invoice_number": "WS-2026-0013",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 209358,
    "status": "Paid",
    "paid_date": "2026-04-22",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0014",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "invoice_number": "WS-2026-0014",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 208035,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0015",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "invoice_number": "WS-2026-0015",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 201679,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0016",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "invoice_number": "WS-2026-0016",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 118581,
    "status": "Paid",
    "paid_date": "2026-03-01",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0017",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "invoice_number": "WS-2026-0017",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 128161,
    "status": "Paid",
    "paid_date": "2026-03-25",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0018",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "invoice_number": "WS-2026-0018",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 129655,
    "status": "Paid",
    "paid_date": "2026-04-28",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0019",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "invoice_number": "WS-2026-0019",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 129621,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0020",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "invoice_number": "WS-2026-0020",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 122361,
    "status": "Overdue",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0021",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "invoice_number": "WS-2026-0021",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 230532,
    "status": "Paid",
    "paid_date": "2026-02-28",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0022",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "invoice_number": "WS-2026-0022",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 242171,
    "status": "Paid",
    "paid_date": "2026-03-25",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0023",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "invoice_number": "WS-2026-0023",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 227543,
    "status": "Paid",
    "paid_date": "2026-05-01",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0024",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "invoice_number": "WS-2026-0024",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 231242,
    "status": "Paid",
    "paid_date": "2026-05-30",
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0025",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "invoice_number": "WS-2026-0025",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 245543,
    "status": "Paid",
    "paid_date": "2026-06-25",
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0026",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "invoice_number": "WS-2026-0026",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 95608,
    "status": "Paid",
    "paid_date": "2026-03-02",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0027",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "invoice_number": "WS-2026-0027",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 102526,
    "status": "Paid",
    "paid_date": "2026-03-27",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0028",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "invoice_number": "WS-2026-0028",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 100338,
    "status": "Paid",
    "paid_date": "2026-04-25",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0029",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "invoice_number": "WS-2026-0029",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 101128,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0030",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "invoice_number": "WS-2026-0030",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 86753,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0031",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "invoice_number": "WS-2026-0031",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 100595,
    "status": "Paid",
    "paid_date": "2026-02-21",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0032",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "invoice_number": "WS-2026-0032",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 94146,
    "status": "Paid",
    "paid_date": "2026-03-29",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0033",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "invoice_number": "WS-2026-0033",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 92617,
    "status": "Paid",
    "paid_date": "2026-05-01",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0034",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "invoice_number": "WS-2026-0034",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 88182,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0035",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "invoice_number": "WS-2026-0035",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 83106,
    "status": "Overdue",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  },
  {
    "invoice_id": "INV-0036",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "invoice_number": "WS-2026-0036",
    "issue_date": "2026-02-01",
    "due_date": "2026-03-03",
    "amount_php": 258903,
    "status": "Paid",
    "paid_date": "2026-02-27",
    "days_overdue": 0,
    "billing_period": "February 2026",
    "description": "Workspace & outsourcing services – February 2026"
  },
  {
    "invoice_id": "INV-0037",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "invoice_number": "WS-2026-0037",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "amount_php": 259135,
    "status": "Paid",
    "paid_date": "2026-03-31",
    "days_overdue": 0,
    "billing_period": "March 2026",
    "description": "Workspace & outsourcing services – March 2026"
  },
  {
    "invoice_id": "INV-0038",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "invoice_number": "WS-2026-0038",
    "issue_date": "2026-04-02",
    "due_date": "2026-05-02",
    "amount_php": 252279,
    "status": "Paid",
    "paid_date": "2026-05-01",
    "days_overdue": 0,
    "billing_period": "April 2026",
    "description": "Workspace & outsourcing services – April 2026"
  },
  {
    "invoice_id": "INV-0039",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "invoice_number": "WS-2026-0039",
    "issue_date": "2026-05-02",
    "due_date": "2026-06-01",
    "amount_php": 254752,
    "status": "Paid",
    "paid_date": "2026-05-30",
    "days_overdue": 0,
    "billing_period": "May 2026",
    "description": "Workspace & outsourcing services – May 2026"
  },
  {
    "invoice_id": "INV-0040",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "invoice_number": "WS-2026-0040",
    "issue_date": "2026-06-01",
    "due_date": "2026-07-01",
    "amount_php": 260174,
    "status": "Unpaid",
    "paid_date": null,
    "days_overdue": 0,
    "billing_period": "June 2026",
    "description": "Workspace & outsourcing services – June 2026"
  }
];

export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    "ticket_id": "SR-0001",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Low",
    "status": "Resolved",
    "submitted_date": "2026-03-17",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-03-25",
    "days_open": 0,
    "client_notes": "No further action required"
  },
  {
    "ticket_id": "SR-0002",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Medium",
    "status": "Open",
    "submitted_date": "2026-05-02",
    "assigned_to": "HR & Compliance",
    "resolved_date": null,
    "days_open": 31,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0003",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Low",
    "status": "Resolved",
    "submitted_date": "2026-02-28",
    "assigned_to": "HR & Compliance",
    "resolved_date": "2026-03-14",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0004",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "IT Support",
    "description": "Hardware, software, or connectivity issue",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-03-09",
    "assigned_to": "Account Management",
    "resolved_date": "2026-03-18",
    "days_open": 0,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0005",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Medium",
    "status": "In Progress",
    "submitted_date": "2026-04-08",
    "assigned_to": "Account Management",
    "resolved_date": null,
    "days_open": 55,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0006",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "High",
    "status": "Resolved",
    "submitted_date": "2026-03-10",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-03-18",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0007",
    "client_id": "CLT-001",
    "company_name": "Nexus Logistics",
    "request_type": "IT Support",
    "description": "Hardware, software, or connectivity issue",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-05-24",
    "assigned_to": "HR & Compliance",
    "resolved_date": "2026-05-25",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0008",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Medium",
    "status": "Open",
    "submitted_date": "2026-03-03",
    "assigned_to": "IT Support Team",
    "resolved_date": null,
    "days_open": 91,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0009",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-05-23",
    "assigned_to": "Operations Team",
    "resolved_date": "2026-05-27",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0010",
    "client_id": "CLT-002",
    "company_name": "BrightPath BPO",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "High",
    "status": "Resolved",
    "submitted_date": "2026-05-16",
    "assigned_to": "Facilities Team",
    "resolved_date": "2026-05-26",
    "days_open": 0,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0011",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "IT Support",
    "description": "Hardware, software, or connectivity issue",
    "priority": "High",
    "status": "Open",
    "submitted_date": "2026-05-20",
    "assigned_to": "Account Management",
    "resolved_date": null,
    "days_open": 13,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0012",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "Access & Security",
    "description": "Badge, visitor pass, or door access request",
    "priority": "Low",
    "status": "Open",
    "submitted_date": "2026-04-03",
    "assigned_to": "IT Support Team",
    "resolved_date": null,
    "days_open": 60,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0013",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "Medium",
    "status": "Open",
    "submitted_date": "2026-04-19",
    "assigned_to": "Facilities Team",
    "resolved_date": null,
    "days_open": 44,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0014",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "High",
    "status": "In Progress",
    "submitted_date": "2026-04-05",
    "assigned_to": "Facilities Team",
    "resolved_date": null,
    "days_open": 58,
    "client_notes": "No further action required"
  },
  {
    "ticket_id": "SR-0015",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "Access & Security",
    "description": "Badge, visitor pass, or door access request",
    "priority": "High",
    "status": "Open",
    "submitted_date": "2026-05-01",
    "assigned_to": "HR & Compliance",
    "resolved_date": null,
    "days_open": 32,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0016",
    "client_id": "CLT-003",
    "company_name": "Horizon Retail",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Low",
    "status": "Resolved",
    "submitted_date": "2026-03-10",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-03-24",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0017",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "request_type": "Access & Security",
    "description": "Badge, visitor pass, or door access request",
    "priority": "High",
    "status": "Resolved",
    "submitted_date": "2026-03-31",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-04-04",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0018",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "request_type": "Access & Security",
    "description": "Badge, visitor pass, or door access request",
    "priority": "High",
    "status": "Resolved",
    "submitted_date": "2026-06-01",
    "assigned_to": "Account Management",
    "resolved_date": "2026-06-06",
    "days_open": 0,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0019",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "High",
    "status": "Resolved",
    "submitted_date": "2026-02-28",
    "assigned_to": "Facilities Team",
    "resolved_date": "2026-03-11",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0020",
    "client_id": "CLT-004",
    "company_name": "AquaCore Systems",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Low",
    "status": "Open",
    "submitted_date": "2026-05-05",
    "assigned_to": "Account Management",
    "resolved_date": null,
    "days_open": 28,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0021",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-04-01",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-04-15",
    "days_open": 0,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0022",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Low",
    "status": "In Progress",
    "submitted_date": "2026-02-13",
    "assigned_to": "HR & Compliance",
    "resolved_date": null,
    "days_open": 109,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0023",
    "client_id": "CLT-005",
    "company_name": "SkyBridge Finance",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "High",
    "status": "In Progress",
    "submitted_date": "2026-02-11",
    "assigned_to": "IT Support Team",
    "resolved_date": null,
    "days_open": 111,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0024",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Low",
    "status": "Open",
    "submitted_date": "2026-03-17",
    "assigned_to": "Operations Team",
    "resolved_date": null,
    "days_open": 77,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0025",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-03-21",
    "assigned_to": "Facilities Team",
    "resolved_date": "2026-03-27",
    "days_open": 0,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0026",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "Medium",
    "status": "In Progress",
    "submitted_date": "2026-04-22",
    "assigned_to": "Operations Team",
    "resolved_date": null,
    "days_open": 41,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0027",
    "client_id": "CLT-006",
    "company_name": "Pinnacle Pharma",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-03-11",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-03-19",
    "days_open": 0,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0028",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Low",
    "status": "Open",
    "submitted_date": "2026-03-21",
    "assigned_to": "HR & Compliance",
    "resolved_date": null,
    "days_open": 73,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0029",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Medium",
    "status": "In Progress",
    "submitted_date": "2026-04-29",
    "assigned_to": "IT Support Team",
    "resolved_date": null,
    "days_open": 34,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0030",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "High",
    "status": "In Progress",
    "submitted_date": "2026-04-26",
    "assigned_to": "HR & Compliance",
    "resolved_date": null,
    "days_open": 37,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0031",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-03-15",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-03-16",
    "days_open": 0,
    "client_notes": "Awaiting client confirmation"
  },
  {
    "ticket_id": "SR-0032",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Medium",
    "status": "Open",
    "submitted_date": "2026-05-18",
    "assigned_to": "Account Management",
    "resolved_date": null,
    "days_open": 15,
    "client_notes": "No further action required"
  },
  {
    "ticket_id": "SR-0033",
    "client_id": "CLT-007",
    "company_name": "Coastal Shipping",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-05-06",
    "assigned_to": "HR & Compliance",
    "resolved_date": "2026-05-10",
    "days_open": 0,
    "client_notes": "Escalated to senior team"
  },
  {
    "ticket_id": "SR-0034",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "request_type": "Headcount Change",
    "description": "Request to add or remove contracted seats",
    "priority": "Medium",
    "status": "Resolved",
    "submitted_date": "2026-05-21",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-06-04",
    "days_open": 0,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0035",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "request_type": "Facilities",
    "description": "Aircon, lighting, cleaning, or furniture request",
    "priority": "Medium",
    "status": "In Progress",
    "submitted_date": "2026-02-23",
    "assigned_to": "Facilities Team",
    "resolved_date": null,
    "days_open": 99,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0036",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "request_type": "Access & Security",
    "description": "Badge, visitor pass, or door access request",
    "priority": "Low",
    "status": "Resolved",
    "submitted_date": "2026-03-23",
    "assigned_to": "IT Support Team",
    "resolved_date": "2026-04-01",
    "days_open": 0,
    "client_notes": "Client followed up via email"
  },
  {
    "ticket_id": "SR-0037",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "request_type": "Other",
    "description": "General inquiry or miscellaneous request",
    "priority": "Low",
    "status": "In Progress",
    "submitted_date": "2026-02-06",
    "assigned_to": "Account Management",
    "resolved_date": null,
    "days_open": 116,
    "client_notes": null
  },
  {
    "ticket_id": "SR-0038",
    "client_id": "CLT-008",
    "company_name": "UrbanEdge Property",
    "request_type": "Contract Query",
    "description": "Question about contract terms or renewal",
    "priority": "Low",
    "status": "Resolved",
    "submitted_date": "2026-05-14",
    "assigned_to": "Account Management",
    "resolved_date": "2026-05-17",
    "days_open": 0,
    "client_notes": "No further action required"
  }
];

// --- Lookup helpers ---

function norm(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

const GENERIC_DOMAINS = new Set([
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'kmc.solutions',
]);

export function findClient(args: {
  company?: string | null;
  email?: string | null;
  client_id?: string | null;
  primary_contact?: string | null;
}): Client | null {
  const company = norm(args.company);
  const email = norm(args.email);
  const id = norm(args.client_id);
  const contact = norm(args.primary_contact);

  if (id) {
    return CLIENTS.find((c) => norm(c.client_id) === id) ?? null;
  }

  if (company) {
    const exact = CLIENTS.find((c) => norm(c.company_name) === company);
    if (exact) return exact;
    const partial = CLIENTS.find((c) =>
      norm(c.company_name).includes(company)
    );
    if (partial) return partial;
  }

  if (contact) {
    const exact = CLIENTS.find((c) => norm(c.primary_contact) === contact);
    if (exact) return exact;
    const parts = contact.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const partial = CLIENTS.find((c) => {
        const cContact = norm(c.primary_contact);
        return parts.every((p) => cContact.includes(p));
      });
      if (partial) return partial;
    }
  }

  if (email) {
    const direct = CLIENTS.find((c) => norm(c.email) === email);
    if (direct) return direct;
    const domain = email.split('@')[1];
    if (domain && !GENERIC_DOMAINS.has(domain)) {
      const root = domain.split('.')[0];
      const byDomain = CLIENTS.find((c) =>
        norm(c.company_name).replace(/\s+/g, '').includes(root)
      );
      if (byDomain) return byDomain;
    }
  }

  return null;
}

export function getInvoicesForClient(args: {
  client_id?: string | null;
  status?: string | null;
  billing_period?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}): Invoice[] {
  const id = norm(args.client_id);
  const status = norm(args.status);
  const period = norm(args.billing_period);

  return INVOICES.filter((inv) => {
    if (id && norm(inv.client_id) !== id) return false;
    if (status && norm(inv.status) !== status) return false;
    if (period && !norm(inv.billing_period).includes(period)) return false;
    if (args.date_from && inv.issue_date < args.date_from) return false;
    if (args.date_to && inv.issue_date > args.date_to) return false;
    return true;
  }).sort((a, b) => (a.issue_date < b.issue_date ? 1 : -1));
}

export function getSeatAllocationForClient(args: {
  client_id?: string | null;
}): SeatRecord | null {
  const id = norm(args.client_id);
  if (!id) return null;
  return SEATS.find((s) => norm(s.client_id) === id) ?? null;
}

export function getServiceRequestsForClient(args: {
  client_id?: string | null;
  status?: string | null;
  request_type?: string | null;
}): ServiceRequest[] {
  const id = norm(args.client_id);
  const status = norm(args.status);
  const type = norm(args.request_type);

  return SERVICE_REQUESTS.filter((sr) => {
    if (id && norm(sr.client_id) !== id) return false;
    if (status === 'active') {
      if (norm(sr.status) === 'resolved') return false;
    } else if (status) {
      if (norm(sr.status) !== status) return false;
    }
    if (type && norm(sr.request_type) !== type) return false;
    return true;
  }).sort((a, b) => (a.submitted_date < b.submitted_date ? 1 : -1));
}
