import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  category: string;
  count: number;
}


const hardcoded = {
    "categories": [
        {
            "category": "New Service Setup",
            "count": 54
        },
        {
            "category": "Billing Inquiry",
            "count": 182
        },
        {
            "category": "Service Modification",
            "count": 162
        },
        {
            "category": "Contract Inquiries",
            "count": 70
        },
        {
            "category": "Promotional Inquiry",
            "count": 51
        },
        {
            "category": "Technical Support",
            "count": 146
        },
        {
            "category": "Number Portability",
            "count": 67
        },
        {
            "category": "Technician Setup",
            "count": 62
        },
        {
            "category": "New Service Inquiry",
            "count": 65
        },
        {
            "category": "Coverage Inquiry",
            "count": 15
        },
        {
            "category": "Account Access Issue",
            "count": 67
        },
        {
            "category": "Insurance Inquiry",
            "count": 41
        },
        {
            "category": "Lost/Stolen Device",
            "count": 60
        },
        {
            "category": "Billing Dispute",
            "count": 129
        },
        {
            "category": "International Services",
            "count": 60
        },
        {
            "category": "Service Disruption",
            "count": 58
        }
    ]
};


// Custom hook to fetch categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://bplap23k43.execute-api.us-east-1.amazonaws.com/prod/intents');
        setCategories(response.data.categories);
        setLoading(false);
      } catch (err) {
        // setError('Error fetching categories');
        setCategories(hardcoded.categories);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, loading, error };
};