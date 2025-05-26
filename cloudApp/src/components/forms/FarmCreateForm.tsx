import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { farmValidationSchema, defaultFarmValues, farmTypeOptions, FarmFormData } from '../../utils/validation/farmValidation';

interface FarmCreateFormProps {
  onSubmit: (values: FarmFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

const FarmCreateForm: React.FC<FarmCreateFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
  onCancel,
}) => {
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardHeader
        title="Create New Farm"
        subheader="Fill in the details below to register a new farm"
        titleTypographyProps={{ variant: 'h4', component: 'h1' }}
      />
      <CardContent>
        <Formik
          initialValues={defaultFarmValues}
          validationSchema={farmValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values);
            } catch (err) {
              console.error('Form submission error:', err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Basic Farm Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="name"
                    label="Farm Name"
                    variant="outlined"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="location"
                    label="Location"
                    variant="outlined"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    name="farmType"
                    label="Farm Type"
                    variant="outlined"
                    value={values.farmType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.farmType && Boolean(errors.farmType)}
                    helperText={touched.farmType && errors.farmType}
                    required
                  >
                    {farmTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="size"
                    label="Farm Size (acres)"
                    type="number"
                    variant="outlined"
                    value={values.size}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.size && Boolean(errors.size)}
                    helperText={touched.size && errors.size}
                    inputProps={{ min: 0, step: 0.1 }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label="Description"
                    variant="outlined"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    placeholder="Brief description of the farm..."
                  />
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="contactInfo.ownerName"
                    label="Owner Name"
                    variant="outlined"
                    value={values.contactInfo.ownerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactInfo?.ownerName && Boolean(errors.contactInfo?.ownerName)}
                    helperText={touched.contactInfo?.ownerName && errors.contactInfo?.ownerName}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="contactInfo.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    value={values.contactInfo.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactInfo?.email && Boolean(errors.contactInfo?.email)}
                    helperText={touched.contactInfo?.email && errors.contactInfo?.email}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="contactInfo.phone"
                    label="Phone Number"
                    variant="outlined"
                    value={values.contactInfo.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactInfo?.phone && Boolean(errors.contactInfo?.phone)}
                    helperText={touched.contactInfo?.phone && errors.contactInfo?.phone}
                    required
                  />
                </Grid>

                {/* Form Actions */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    {onCancel && (
                      <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isLoading || isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || isSubmitting}
                      startIcon={
                        (isLoading || isSubmitting) && (
                          <CircularProgress size={20} color="inherit" />
                        )
                      }
                    >
                      {isLoading || isSubmitting ? 'Creating Farm...' : 'Create Farm'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default FarmCreateForm;
