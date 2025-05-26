import * as yup from 'yup';

export const farmValidationSchema = yup.object({
  name: yup
    .string()
    .required('Farm name is required')
    .min(2, 'Farm name must be at least 2 characters')
    .max(100, 'Farm name must be less than 100 characters')
    .trim(),
  
  location: yup
    .string()
    .required('Location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters')
    .trim(),
  
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  
  contactInfo: yup.object({
    ownerName: yup
      .string()
      .required('Owner name is required')
      .min(2, 'Owner name must be at least 2 characters')
      .max(100, 'Owner name must be less than 100 characters')
      .trim(),
    
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
    
    phone: yup
      .string()
      .matches(
        /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
        'Invalid phone number format'
      )
      .required('Phone number is required'),
  }),
  
  size: yup
    .number()
    .positive('Farm size must be a positive number')
    .required('Farm size is required'),
  
  farmType: yup
    .string()
    .required('Farm type is required')
    .oneOf(
      ['crop', 'livestock', 'mixed', 'aquaculture', 'orchard', 'greenhouse'],
      'Invalid farm type'
    ),
});

export type FarmFormData = yup.InferType<typeof farmValidationSchema>;

// Default form values
export const defaultFarmValues: FarmFormData = {
  name: '',
  location: '',
  description: '',
  contactInfo: {
    ownerName: '',
    email: '',
    phone: '',
  },
  size: 0,
  farmType: 'crop',
};

// Farm type options for dropdown
export const farmTypeOptions = [
  { value: 'crop', label: 'Crop Farm' },
  { value: 'livestock', label: 'Livestock Farm' },
  { value: 'mixed', label: 'Mixed Farm' },
  { value: 'aquaculture', label: 'Aquaculture' },
  { value: 'orchard', label: 'Orchard' },
  { value: 'greenhouse', label: 'Greenhouse' },
];
