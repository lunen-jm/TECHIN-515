import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Slider,
  Button,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import SiloIndicator from './common/SiloIndicator';
import ModernSilo from './common/ModernSilo';
import MinimalSilo from './common/MinimalSilo';
import SimpleSilo from './common/SimpleSilo';
import TriangularSilo from './common/TriangularSilo';
import DetailedSilo from './common/DetailedSilo';

const SiloShowcase: React.FC = () => {
  const [fillPercentage, setFillPercentage] = useState(65);
  const [animatedDemo, setAnimatedDemo] = useState(false);

  // Demo data for multiple silos
  const demoSilos = [
    { id: 1, label: 'Wheat Storage', percentage: 85, capacity: '500 tons' },
    { id: 2, label: 'Corn Storage', percentage: 42, capacity: '750 tons' },
    { id: 3, label: 'Barley Storage', percentage: 15, capacity: '300 tons' },
    { id: 4, label: 'Oats Storage', percentage: 95, capacity: '200 tons' },
  ];

  // Animated demo effect
  useEffect(() => {
    if (animatedDemo) {
      const interval = setInterval(() => {
        setFillPercentage(prev => {
          const newValue = prev + (Math.random() - 0.5) * 10;
          return Math.max(10, Math.min(95, newValue));
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [animatedDemo]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Grain Silo Components Showcase
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Interactive grain silo indicators for displaying storage levels across your farm.
      </Typography>

      {/* Interactive Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Interactive Demo
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Fill Percentage: {fillPercentage}%</Typography>
          <Slider
            value={fillPercentage}
            onChange={(_, value) => setFillPercentage(value as number)}
            min={0}
            max={100}
            step={1}
            sx={{ mb: 2 }}
          />
          <Button
            variant={animatedDemo ? 'contained' : 'outlined'}
            onClick={() => setAnimatedDemo(!animatedDemo)}
            size="small"
          >
            {animatedDemo ? 'Stop' : 'Start'} Random Animation
          </Button>
        </Box>        <Grid container spacing={4} justifyContent="center">
          {/* Basic Silo Variants */}
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Basic</Typography>
              <SiloIndicator
                fillPercentage={fillPercentage}
                label="Test Silo"
                variant="basic"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Detailed</Typography>
              <SiloIndicator
                fillPercentage={fillPercentage}
                label="Test Silo"
                variant="detailed"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Minimal</Typography>
              <SiloIndicator
                fillPercentage={fillPercentage}
                label="Test Silo"
                variant="minimal"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Modern</Typography>
              <ModernSilo
                fillPercentage={fillPercentage}
                label="Test Silo"
                capacity="500 tons"
                animated={true}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* New Minimal Variants */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ultra-Minimal Variants
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Very clean and simple designs for compact dashboard use.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {/* MinimalSilo variants */}
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Clean</Typography>
              <MinimalSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="clean"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Rounded</Typography>
              <MinimalSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="rounded"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Flat</Typography>
              <MinimalSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="flat"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Outlined</Typography>
              <MinimalSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            SimpleSilo Variants
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item>
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Capsule</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  label="Grain"
                  variant="capsule"
                  size="md"
                />
              </Box>
            </Grid>
            
            <Grid item>
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Square</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  label="Grain"
                  variant="square"
                  size="md"
                />
              </Box>
            </Grid>
            
            <Grid item>
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Circle</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  label="Grain"
                  variant="circle"
                  size="md"
                />
              </Box>
            </Grid>
            
            <Grid item>
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Thin</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  label="Grain"
                  variant="thin"
                  size="md"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Size Variations
          </Typography>
          <Grid container spacing={2} justifyContent="center" alignItems="end">
            <Grid item>
              <Box textAlign="center">
                <Typography variant="caption" gutterBottom display="block">XS</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  size="xs"
                  variant="capsule"
                  showPercentage={false}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box textAlign="center">
                <Typography variant="caption" gutterBottom display="block">SM</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  size="sm"
                  variant="capsule"
                  showPercentage={false}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box textAlign="center">
                <Typography variant="caption" gutterBottom display="block">MD</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  size="md"
                  variant="capsule"
                  showPercentage={false}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box textAlign="center">
                <Typography variant="caption" gutterBottom display="block">LG</Typography>
                <SimpleSilo
                  fillPercentage={fillPercentage}
                  size="lg"
                  variant="capsule"
                  showPercentage={false}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Triangular Silo Variants */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Triangular Top Variants
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Silo designs with triangular tops and small curved tips.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Pointed</Typography>
              <TriangularSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="pointed"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Curved</Typography>
              <TriangularSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="curved"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Steep</Typography>
              <TriangularSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="steep"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Gentle</Typography>
              <TriangularSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="gentle"
              />
            </Box>
          </Grid>
          
          <Grid item>            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Modern</Typography>
              <TriangularSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="modern"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Detailed Silo Variants */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Industrial Variants
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Highly detailed silo designs with industrial features, structural elements, and enhanced visual depth.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Industrial</Typography>
              <DetailedSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="industrial"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Classic</Typography>
              <DetailedSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="classic"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Modern</Typography>
              <DetailedSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="modern"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Vintage</Typography>
              <DetailedSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="vintage"
              />
            </Box>
          </Grid>
          
          <Grid item>
            <Box textAlign="center">
              <Typography variant="subtitle2" gutterBottom>Technical</Typography>
              <DetailedSilo
                fillPercentage={fillPercentage}
                label="Storage"
                variant="technical"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Card Integration Examples */}
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Card Integration Examples
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's how the silo components look when integrated into cards for dashboard use.
      </Typography>      <Grid container spacing={3}>
        {demoSilos.map((silo) => (
          <Grid item xs={12} sm={6} md={3} key={silo.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                <SimpleSilo
                  fillPercentage={silo.percentage}
                  label={silo.label}
                  variant="capsule"
                  size="md"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {silo.capacity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Clean Minimal Style Cards
        </Typography>
        <Grid container spacing={3}>
          {demoSilos.map((silo) => (
            <Grid item xs={12} sm={6} md={3} key={`clean-${silo.id}`}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                  <MinimalSilo
                    fillPercentage={silo.percentage}
                    label={silo.label}
                    variant="clean"
                    height={80}
                    width={40}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {silo.capacity}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Triangular Top Style Cards
        </Typography>
        <Grid container spacing={3}>
          {demoSilos.map((silo, index) => {
            const variants = ['pointed', 'curved', 'steep', 'gentle'];
            const variant = variants[index % variants.length] as 'pointed' | 'curved' | 'steep' | 'gentle';
            
            return (
              <Grid item xs={12} sm={6} md={3} key={`triangular-${silo.id}`}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <TriangularSilo
                      fillPercentage={silo.percentage}
                      label={silo.label}
                      variant={variant}
                      height={90}
                      width={45}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {silo.capacity}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Detailed Industrial Style Cards
        </Typography>
        <Grid container spacing={3}>
          {demoSilos.map((silo, index) => {
            const variants = ['industrial', 'classic', 'modern', 'vintage'];
            const variant = variants[index % variants.length] as 'industrial' | 'classic' | 'modern' | 'vintage';
            
            return (
              <Grid item xs={12} sm={6} md={3} key={`detailed-${silo.id}`}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                    <DetailedSilo
                      fillPercentage={silo.percentage}
                      label={silo.label}
                      variant={variant}
                      height={100}
                      width={50}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {silo.capacity}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {demoSilos.map((silo) => (
            <Grid item xs={12} sm={6} md={3} key={`basic-${silo.id}`}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                  <SiloIndicator
                    fillPercentage={silo.percentage}
                    label={silo.label}
                    variant="detailed"
                    height={100}
                    width={50}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {silo.capacity}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>      {/* Usage Examples */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Usage Examples
        </Typography><Typography variant="body2" component="pre" sx={{ 
          backgroundColor: 'background.paper', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.85rem',
          fontFamily: 'Monaco, monospace'
        }}>
{`// Basic usage
<SiloIndicator fillPercentage={75} label="Wheat Storage" />

// Ultra-minimal clean style
<MinimalSilo 
  fillPercentage={85} 
  label="Corn Storage"
  variant="clean"
  height={80}
  width={40}
/>

// Simple capsule with size options
<SimpleSilo
  fillPercentage={42}
  label="Barley Storage"
  variant="capsule"
  size="md"
  color="primary"
/>

// Triangular top with curved tip
<TriangularSilo
  fillPercentage={68}
  label="Grain Storage"
  variant="curved"
  height={100}
  width={50}
/>

// Sharp pointed triangular silo
<TriangularSilo
  fillPercentage={92}
  label="Feed Storage"
  variant="pointed"
/>

// Detailed industrial-style silo
<DetailedSilo
  fillPercentage={78}
  label="Premium Storage"
  variant="industrial"
  height={120}
  width={60}
/>

// Classic detailed silo with vintage styling
<DetailedSilo
  fillPercentage={85}
  label="Heritage Storage"
  variant="vintage"
/>

// Tiny indicators for compact displays
<SimpleSilo
  fillPercentage={67}
  variant="thin"
  size="xs"
  showPercentage={false}
/>`}
        </Typography>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Real Tank Data Implementation Examples */}
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Real Tank Data Implementation Examples
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's how the detailed silo indicators would look when integrated with real tank data from your individual device pages.
      </Typography>

      {/* Mock tank data similar to what's used in DeviceDetailView and FarmDetailView */}
      <Grid container spacing={3}>
        {/* Wheat Storage Tank */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tank A-01
                </Typography>
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success" 
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SiloIndicator
                  fillPercentage={Math.round((300 - 75) / 3)} // LiDAR: 75cm = 75% full
                  label="Wheat Storage"
                  variant="detailed"
                  height={120}
                  width={60}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Capacity:</strong> 1,500 tons
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Current Fill:</strong> 1,125 tons
              </Typography>
              
              <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Temperature</Typography>
                <Typography variant="caption" fontWeight={600}>18.50°C</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Humidity</Typography>
                <Typography variant="caption" fontWeight={600}>45%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">CO₂</Typography>
                <Typography variant="caption" fontWeight={600}>520 ppm</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Corn Storage Tank */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tank B-03
                </Typography>
                <Chip 
                  label="Active" 
                  size="small" 
                  color="success" 
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SiloIndicator
                  fillPercentage={Math.round((300 - 180) / 3)} // LiDAR: 180cm = 40% full
                  label="Corn Storage"
                  variant="detailed"
                  height={120}
                  width={60}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Capacity:</strong> 2,000 tons
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Current Fill:</strong> 800 tons
              </Typography>
              
              <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Temperature</Typography>
                <Typography variant="caption" fontWeight={600}>22.10°C</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Humidity</Typography>
                <Typography variant="caption" fontWeight={600}>38%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">CO₂</Typography>
                <Typography variant="caption" fontWeight={600}>680 ppm</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Soybean Storage Tank - Warning State */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tank C-02
                </Typography>
                <Chip 
                  label="Warning" 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SiloIndicator
                  fillPercentage={Math.round((300 - 45) / 3)} // LiDAR: 45cm = 85% full
                  label="Soybean Storage"
                  variant="detailed"
                  height={120}
                  width={60}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Capacity:</strong> 1,200 tons
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Current Fill:</strong> 1,020 tons
              </Typography>
              
              <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Temperature</Typography>
                <Typography variant="caption" fontWeight={600} color="warning.main">26.80°C</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Humidity</Typography>
                <Typography variant="caption" fontWeight={600}>52%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">CO₂</Typography>
                <Typography variant="caption" fontWeight={600}>750 ppm</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rice Storage Tank - Low Fill + Battery Issue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tank D-01
                </Typography>
                <Chip 
                  label="Low Battery" 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <SiloIndicator
                  fillPercentage={Math.round((300 - 270) / 3)} // LiDAR: 270cm = 10% full
                  label="Rice Storage"
                  variant="detailed"
                  height={120}
                  width={60}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Capacity:</strong> 800 tons
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Current Fill:</strong> 80 tons
              </Typography>
              
              <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Temperature</Typography>
                <Typography variant="caption" fontWeight={600}>16.30°C</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Humidity</Typography>
                <Typography variant="caption" fontWeight={600}>41%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">CO₂</Typography>
                <Typography variant="caption" fontWeight={600}>480 ppm</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Implementation Notes */}      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Implementation Notes for Tank Pages
        </Typography>
        <Typography variant="body2" component="div" sx={{ fontSize: '0.9rem' }}>
          <strong>Data Integration:</strong>
          <ul>
            <li>LiDAR readings are converted to fill percentages: <code>(300 - lidarValue) / 3</code></li>
            <li>Tank capacity and current fill calculated from fill percentage and tank specs</li>
            <li>Status indicators based on sensor thresholds (temperature, battery, etc.)</li>
            <li>Color coding: Green (&lt;75%), Orange (75-90%), Red (&gt;90%)</li>
          </ul>
          
          <strong style={{ marginTop: '16px', display: 'block' }}>Usage Example:</strong>
        </Typography>        <Typography variant="body2" component="pre" sx={{ 
          backgroundColor: 'background.paper', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.8rem',
          fontFamily: 'Monaco, monospace',
          mt: 2
        }}>
{`// Calculate fill percentage from LiDAR data
const fillPercentage = Math.round((300 - device.latestReadings.lidar) / 3);
const currentFill = Math.round((fillPercentage / 100) * tankCapacity);

// Implement in tank page
<SiloIndicator
  fillPercentage={fillPercentage}
  label={\`\${device.type} Storage\`}
  variant="detailed"
  height={120}
  width={60}
/>`}
        </Typography>
      </Paper>
    </Box>
  );
};

export default SiloShowcase;
