// src/constants/productSectionData.tsx
import React from 'react';
import { Shield, Award, Clock, Headphones } from 'lucide-react';

export const companyTrustData = [
  { 
    icon: <Shield className="w-6 h-6" />, 
    title: 'Quality Guaranteed', 
    description: 'All products are made with premium materials and quality checked'
  },
  { 
    icon: <Award className="w-6 h-6" />, 
    title: 'Trusted Service', 
    description: 'Serving customers across Ethiopia with reliable service'
  },
  { 
    icon: <Clock className="w-6 h-6" />, 
    title: 'Fast Delivery', 
    description: 'Orders delivered within 3-5 business days'
  },
  { 
    icon: <Headphones className="w-6 h-6" />, 
    title: 'Customer Support', 
    description: 'Dedicated support team ready to assist you'
  }
];