import { useState, useEffect } from 'react';
import axios from 'axios';

interface Data {
    intent: string;
    category: string;
}


const hardcoded = {
    "csv_data": [
        {
            "intent": "Original Text",
            "category": " Category"
        },
        {
            "intent": "Initiate the provisioning of a brand-new phone or web-based connection",
            "category": " New Service Setup"
        },
        {
            "intent": "Assess your monthly fee",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Solicit a temporary service stoppage",
            "category": " Service Modification"
        },
        {
            "intent": "Investigate early termination charges",
            "category": " Contract Inquiries"
        },
        {
            "intent": "Review your monthly rate",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Request a copy of former charges",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Acquire a facsimile of old receipts",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Demand a duplicate of former charges",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Review your monthly expense",
            "category": " Billing Inquiry"
        },
        {
            "intent": "Upgrade or change your existing setup",
            "category": " Service Modification"
        },
        {
            "intent": "Gather intel on available promotional offerings",
            "category": " Promotional Inquiry"
        },
        {
            "intent": "Crack a technical code",
            "category": " Technical Support"
        },
        {
            "intent": "Solicit a brief service cessation",
            "category": " Service Modification"
        },
        {
            "intent": "Inquire about the possibility of porting a phone number",
            "category": " Number Portability"
        },
        {
            "intent": "Delve into a technical issue",
            "category": " Technical Support"
        },
        {
            "intent": "Secure a technician for installation",
            "category": " Technician Setup"
        },
        {
            "intent": "Discover the insights on data consumption and penalty fees",
            "category": " Billing Inquiry"
        }
    ]
};


// Custom hook to fetch categories
export const useData = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://bplap23k43.execute-api.us-east-1.amazonaws.com/prod/data');
        setData(response.data.csv_data);
        setLoading(false);
      } catch (err) {
        // setError('Error fetching categories');
        setData(hardcoded.csv_data);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};