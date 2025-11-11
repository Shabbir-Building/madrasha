export type Donation = {
  _id: string;
  branch: number;
  donation_type: number;
  fullname: string;
  phone_number: string;
  donation_amount: number;
  donation_date: string;
  notes?: string;
  admin_id: {
    _id: string;
    employee_id: {
      _id: string;
      fullname: string;
    };
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateDonationInput = {
  branch: number;
  donation_type: number;
  fullname: string;
  phone_number: string;
  donation_amount: number;
  donation_date: string;
  notes?: string;
};

export type UpdateDonationInput = CreateDonationInput;
