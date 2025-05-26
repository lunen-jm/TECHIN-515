import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Co2 as Co2Icon,
  Height as HeightIcon,
  Battery90 as BatteryGoodIcon,
  SignalWifi4Bar as SignalGoodIcon,
} from '@mui/icons-material';
import SiloIndicator from './common/SiloIndicator';

// Mock data for demonstration
const mockDevice = {
  name: "Grain Bin #3",
  type: "Grain Storage",
  isActive: true,
  lowBattery: false,
};

const mockReadings = {
  temperature: 24.50,
  humidity: 62.00,
  co2: 850.00,
  fillLevel: 67,
  lidarDistance: 99.00,
};

const DeviceLayoutShowcase: React.FC = () => {  const [selectedLayout, setSelectedLayout] = useState<string>('layout3');

  const handleLayoutChange = (event: SelectChangeEvent) => {
    setSelectedLayout(event.target.value);
  };

  // Layout 1: Large Bin (1/3) + Compact Stats (2/3)
  const Layout1 = () => (
    <Grid container spacing={4}>
      {/* Large Grain Bin Card - 1/3 width */}
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#111827' }}>
              {mockDevice.type}
            </Typography>
          </Box>

          {/* Extra Large Silo */}
          <Box sx={{ mb: 4 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="minimal"
              height={280}
              width={140}
              showPercentage={false}
            />
          </Box>

          {/* Single prominent metric */}
          <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 3, p: 3, border: '1px solid #F3F4F6' }}>
            <Typography variant="h2" fontWeight={700} color="#3B82F6" gutterBottom>
              {mockReadings.fillLevel}%
            </Typography>
            <Typography variant="body1" color="#6B7280" fontWeight={500}>
              Fill Level
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Compact Stats - 2/3 width */}
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3, 
          background: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="#111827">
            Environmental Monitoring
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 3, bgcolor: '#FEF2F2', borderRadius: 3, border: '1px solid #FECACA' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThermostatIcon sx={{ color: '#EF4444', fontSize: 32, mr: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    Temperature
                  </Typography>
                </Box>                <Typography variant="h3" fontWeight={700} color="#EF4444">
                  {mockReadings.temperature.toFixed(2)}°C
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 3, bgcolor: '#EFF6FF', borderRadius: 3, border: '1px solid #BFDBFE' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WaterDropIcon sx={{ color: '#3B82F6', fontSize: 32, mr: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    Humidity
                  </Typography>
                </Box>                <Typography variant="h3" fontWeight={700} color="#3B82F6">
                  {mockReadings.humidity.toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Co2Icon sx={{ color: '#6B7280', fontSize: 32, mr: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    CO₂ Level
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} color="#6B7280">
                  {mockReadings.co2}
                </Typography>
                <Typography variant="body2" color="#9CA3AF" fontWeight={500}>
                  ppm
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 3, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #BBF7D0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HeightIcon sx={{ color: '#10B981', fontSize: 32, mr: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="#111827">
                    Distance
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} color="#10B981">
                  {mockReadings.lidarDistance}
                </Typography>
                <Typography variant="body2" color="#9CA3AF" fontWeight={500}>
                  cm
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  // Layout 2: Extra Large Bin (1/2) + Single Column Stats (1/2)
  const Layout2 = () => (
    <Grid container spacing={4}>
      {/* Extra Large Grain Bin Card - 1/2 width */}
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ 
          p: 5, 
          borderRadius: 3,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#111827', mb: 4 }}>
            {mockDevice.type}
          </Typography>

          {/* Giant Silo */}
          <Box sx={{ mb: 4 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="detailed"
              height={320}
              width={160}
              showPercentage={false}
            />
          </Box>

          {/* Large metrics */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#EFF6FF', borderRadius: 3, p: 3, border: '1px solid #BFDBFE' }}>
                <Typography variant="h2" fontWeight={700} color="#3B82F6">
                  {mockReadings.fillLevel}%
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={600}>
                  Fill Level
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#FEF2F2', borderRadius: 3, p: 3, border: '1px solid #FECACA' }}>                <Typography variant="h2" fontWeight={700} color="#EF4444">
                  {mockReadings.temperature.toFixed(2)}°C
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={600}>
                  Temp
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Single Column Stats - 1/2 width */}
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3, 
          background: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography variant="h5" fontWeight={600} gutterBottom color="#111827">
            Sensor Readings
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            {/* Temperature */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #F3F4F6' }}>
              <ThermostatIcon sx={{ color: '#EF4444', fontSize: 40, mr: 3 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  Temperature
                </Typography>
                <Typography variant="body2" color="#6B7280">                Internal bin temperature
              </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="#EF4444">
                {mockReadings.temperature.toFixed(2)}°C
              </Typography>
            </Box>

            {/* Humidity */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #F3F4F6' }}>
              <WaterDropIcon sx={{ color: '#3B82F6', fontSize: 40, mr: 3 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  Humidity
                </Typography>
                <Typography variant="body2" color="#6B7280">                Relative humidity level
              </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="#3B82F6">
                {mockReadings.humidity.toFixed(2)}%
              </Typography>
            </Box>

            {/* CO2 */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #F3F4F6' }}>
              <Co2Icon sx={{ color: '#6B7280', fontSize: 40, mr: 3 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  CO₂ Level
                </Typography>
                <Typography variant="body2" color="#6B7280">
                  Carbon dioxide concentration
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight={700} color="#6B7280">
                  {mockReadings.co2}
                </Typography>
                <Typography variant="body2" color="#9CA3AF">
                  ppm
                </Typography>
              </Box>
            </Box>

            {/* Distance */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #F3F4F6' }}>
              <HeightIcon sx={{ color: '#10B981', fontSize: 40, mr: 3 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} color="#111827">
                  Distance to Surface
                </Typography>
                <Typography variant="body2" color="#6B7280">
                  LiDAR measurement
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight={700} color="#10B981">
                  {mockReadings.lidarDistance}
                </Typography>
                <Typography variant="body2" color="#9CA3AF">
                  cm
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Device Status */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={600} color="#111827" gutterBottom>
            Device Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={<BatteryGoodIcon />}
              label="Battery OK"
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<SignalGoodIcon />}
              label="Strong Signal"
              color="success"
              variant="outlined"
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  // Layout 3: Massive Bin Focus (40%) + Minimal Stats (60%)
  const Layout3 = () => (
    <Grid container spacing={4}>
      {/* Massive Grain Bin Card - 40% width */}
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{ 
          p: 6, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          <Typography variant="h3" fontWeight={700} sx={{ color: '#1E293B', mb: 5 }}>
            {mockDevice.name}
          </Typography>

          {/* Massive Silo */}
          <Box sx={{ mb: 5 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="detailed"
              height={360}
              width={180}
              showPercentage={false}
            />
          </Box>

          {/* Hero metric */}
          <Box sx={{ 
            bgcolor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: 4, 
            p: 4, 
            border: '2px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h1" fontWeight={800} color="#3B82F6" sx={{ fontSize: '4rem' }}>
              {mockReadings.fillLevel}%
            </Typography>
            <Typography variant="h6" color="#475569" fontWeight={600} sx={{ mt: 1 }}>
              Current Fill Level
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Minimal Stats Grid - 60% width */}
      <Grid item xs={12} md={7}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <ThermostatIcon sx={{ color: '#EF4444', fontSize: 48, mb: 2 }} />
                <Typography variant="h4" fontWeight={700} color="#EF4444">
                  {mockReadings.temperature}°C
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={500}>
                  Temperature
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <WaterDropIcon sx={{ color: '#3B82F6', fontSize: 48, mb: 2 }} />                <Typography variant="h4" fontWeight={700} color="#3B82F6">
                  {mockReadings.humidity.toFixed(2)}%
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={500}>
                  Humidity
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <Co2Icon sx={{ color: '#6B7280', fontSize: 48, mb: 2 }} />
                <Typography variant="h4" fontWeight={700} color="#6B7280">
                  {mockReadings.co2}
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={500}>
                  CO₂ (ppm)
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                textAlign: 'center'
              }}>
                <HeightIcon sx={{ color: '#10B981', fontSize: 48, mb: 2 }} />
                <Typography variant="h4" fontWeight={700} color="#10B981">
                  {mockReadings.lidarDistance}
                </Typography>
                <Typography variant="body1" color="#6B7280" fontWeight={500}>
                  Distance (cm)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Device Status Card */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: '#F8FAFC', 
            border: '1px solid #E2E8F0'
          }}>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Device Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<BatteryGoodIcon />}
                label="Battery: 85%"
                color="success"
                size="medium"
              />
              <Chip
                icon={<SignalGoodIcon />}
                label="Signal: Strong"
                color="success"
                size="medium"
              />
              <Chip
                label="Status: Online"
                color="success"
                size="medium"
              />
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );

  // Layout 3A: Massive Bin Hero with Dark Theme
  const Layout3A = () => (
    <Grid container spacing={4}>
      {/* Massive Grain Bin Card - Dark Hero Theme */}
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{ 
          p: 6, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          border: '1px solid #475569',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          height: 'fit-content',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glow effect */}
          <Box sx={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }} />
          
          <Typography variant="h3" fontWeight={700} sx={{ color: '#F8FAFC', mb: 5, position: 'relative', zIndex: 1 }}>
            {mockDevice.name}
          </Typography>

          <Box sx={{ mb: 5, position: 'relative', zIndex: 1 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="detailed"
              height={360}
              width={180}
              showPercentage={false}
            />
          </Box>

          {/* Glowing metric */}
          <Box sx={{ 
            bgcolor: 'rgba(59, 130, 246, 0.2)', 
            borderRadius: 4, 
            p: 4, 
            border: '2px solid rgba(59, 130, 246, 0.4)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            <Typography variant="h1" fontWeight={800} color="#60A5FA" sx={{ fontSize: '4rem', textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
              {mockReadings.fillLevel}%
            </Typography>
            <Typography variant="h6" color="#CBD5E1" fontWeight={600} sx={{ mt: 1 }}>
              Current Fill Level
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Neon-style Stats Grid */}
      <Grid item xs={12} md={7}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>            {[
              { icon: ThermostatIcon, value: `${mockReadings.temperature.toFixed(2)}°C`, label: 'Temperature', color: '#EF4444' },
              { icon: WaterDropIcon, value: `${mockReadings.humidity.toFixed(2)}%`, label: 'Humidity', color: '#3B82F6' },
              { icon: Co2Icon, value: mockReadings.co2.toFixed(2), label: 'CO₂ (ppm)', color: '#10B981' },
              { icon: HeightIcon, value: mockReadings.lidarDistance.toFixed(2), label: 'Distance (cm)', color: '#F59E0B' },
            ].map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                  border: `2px solid ${stat.color}40`,
                  textAlign: 'center',
                  boxShadow: `0 0 20px ${stat.color}20`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${stat.color}30`
                  }
                }}>
                  <stat.icon sx={{ color: stat.color, fontSize: 48, mb: 2 }} />
                  <Typography variant="h4" fontWeight={700} color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="#D1D5DB" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );

  // Layout 3B: Massive Bin with Gradient Cards
  const Layout3B = () => (
    <Grid container spacing={4}>
      {/* Massive Grain Bin Card - Gradient Theme */}
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{ 
          p: 6, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          textAlign: 'center',
          height: 'fit-content',
          color: 'white'
        }}>
          <Typography variant="h3" fontWeight={700} sx={{ color: '#FFFFFF', mb: 5, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {mockDevice.name}
          </Typography>

          <Box sx={{ mb: 5 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="detailed"
              height={360}
              width={180}
              showPercentage={false}
            />
          </Box>

          <Box sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: 4, 
            p: 4, 
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)'
          }}>
            <Typography variant="h1" fontWeight={800} color="#FFFFFF" sx={{ fontSize: '4rem', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {mockReadings.fillLevel}%
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.9)" fontWeight={600} sx={{ mt: 1 }}>
              Current Fill Level
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Gradient Stats Cards */}
      <Grid item xs={12} md={7}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            {[
              { icon: ThermostatIcon, value: `${mockReadings.temperature}°C`, label: 'Temperature', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' },
              { icon: WaterDropIcon, value: `${mockReadings.humidity}%`, label: 'Humidity', gradient: 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)' },
              { icon: Co2Icon, value: mockReadings.co2, label: 'CO₂ (ppm)', gradient: 'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)' },
              { icon: HeightIcon, value: mockReadings.lidarDistance, label: 'Distance (cm)', gradient: 'linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)' },
            ].map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: stat.gradient,
                  border: 'none',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
                  }
                }}>
                  <stat.icon sx={{ color: 'white', fontSize: 48, mb: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  <Typography variant="h4" fontWeight={700} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.9)" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );

  // Layout 3C: Massive Bin with Minimalist Cards
  const Layout3C = () => (
    <Grid container spacing={4}>
      {/* Ultra Clean Massive Bin */}
      <Grid item xs={12} md={5}>
        <Paper elevation={0} sx={{ 
          p: 8, 
          borderRadius: 3,
          background: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          <Typography variant="h2" fontWeight={300} sx={{ color: '#334155', mb: 6, letterSpacing: '-0.025em' }}>
            {mockDevice.name}
          </Typography>

          <Box sx={{ mb: 6 }}>
            <SiloIndicator
              fillPercentage={mockReadings.fillLevel}
              variant="minimal"
              height={400}
              width={200}
              showPercentage={false}
            />
          </Box>

          <Box sx={{ 
            p: 6, 
            borderRadius: 2,
            background: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <Typography variant="h1" fontWeight={100} color="#3B82F6" sx={{ fontSize: '5rem', letterSpacing: '-0.05em' }}>
              {mockReadings.fillLevel}
            </Typography>
            <Typography variant="h4" color="#64748B" fontWeight={300} sx={{ mt: 2 }}>
              percent full
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Ultra Minimal Stats */}
      <Grid item xs={12} md={7}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: ThermostatIcon, value: mockReadings.temperature, unit: '°C', label: 'Temperature', color: '#EF4444' },
            { icon: WaterDropIcon, value: mockReadings.humidity, unit: '%', label: 'Humidity', color: '#3B82F6' },
            { icon: Co2Icon, value: mockReadings.co2, unit: 'ppm', label: 'Carbon Dioxide', color: '#10B981' },
            { icon: HeightIcon, value: mockReadings.lidarDistance, unit: 'cm', label: 'Surface Distance', color: '#F59E0B' },
          ].map((stat, index) => (
            <Paper key={index} elevation={0} sx={{ 
              p: 4, 
              borderRadius: 2, 
              background: '#FFFFFF', 
              border: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: '#FAFBFC',
                borderColor: '#E2E8F0'
              }
            }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                background: `${stat.color}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon sx={{ color: stat.color, fontSize: 32 }} />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="#64748B" fontWeight={500} sx={{ mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h3" fontWeight={300} color="#1E293B">
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="#64748B" fontWeight={400}>
                    {stat.unit}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
  const renderLayout = () => {
    switch (selectedLayout) {
      case 'layout1':
        return <Layout1 />;
      case 'layout2':
        return <Layout2 />;
      case 'layout3':
        return <Layout3 />;
      case 'layout3a':
        return <Layout3A />;
      case 'layout3b':
        return <Layout3B />;
      case 'layout3c':
        return <Layout3C />;
      default:
        return <Layout3 />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom color="#111827">
        Device Layout Showcase
      </Typography>
      <Typography variant="body1" color="#6B7280" paragraph>
        Explore different layout options for the device detail page. Each layout emphasizes the grain bin as the focal point with varying approaches to displaying sensor data.
      </Typography>

      {/* Layout Selector */}
      <Box sx={{ mb: 4, maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel>Layout Option</InputLabel>          <Select
            value={selectedLayout}
            onChange={handleLayoutChange}
            label="Layout Option"
          >
            <MenuItem value="layout1">Layout 1: Large Bin (1/3) + Compact Stats (2/3)</MenuItem>
            <MenuItem value="layout2">Layout 2: Extra Large Bin (1/2) + Single Column (1/2)</MenuItem>
            <MenuItem value="layout3">Layout 3: Massive Bin Hero + Clean Grid</MenuItem>
            <MenuItem value="layout3a">Layout 3A: Massive Bin Hero + Dark Theme</MenuItem>
            <MenuItem value="layout3b">Layout 3B: Massive Bin Hero + Gradient Cards</MenuItem>
            <MenuItem value="layout3c">Layout 3C: Massive Bin Hero + Ultra Minimal</MenuItem>
          </Select>
        </FormControl>
      </Box>      {/* Layout Descriptions */}
      <Box sx={{ mb: 4, p: 3, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #F3F4F6' }}>
        {selectedLayout === 'layout1' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 1: Large Bin Focus with Compact Stats
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Grain bin takes 1/3 of the space with extra-large silo (280px tall)
              <br />• Stats take 2/3 with colorful 2x2 grid cards
              <br />• Single prominent fill percentage on bin card
              <br />• Larger sensor value displays with colored backgrounds
            </Typography>
          </Box>
        )}
        {selectedLayout === 'layout2' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 2: Extra Large Bin with Single Column Stats
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Grain bin takes 1/2 of the space with massive silo (320px tall)
              <br />• Single column stats with large icons and descriptions
              <br />• Two key metrics displayed on bin card (fill level + temperature)
              <br />• Horizontal sensor cards with detailed information
            </Typography>
          </Box>
        )}
        {selectedLayout === 'layout3' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 3: Massive Bin Hero with Clean Grid
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Grain bin takes 40% with hero-sized silo (360px tall)
              <br />• Light gradient background with glassy fill percentage display
              <br />• Clean 2x2 stats grid with large icons
              <br />• Separate device status card
              <br />• Professional and balanced presentation
            </Typography>
          </Box>
        )}
        {selectedLayout === 'layout3a' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 3A: Massive Bin Hero with Dark Theme
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Dark gradient background with subtle glow effects
              <br />• Neon-style glowing fill percentage with animations
              <br />• Dark stats cards with colored borders and shadows
              <br />• Cyberpunk/futuristic aesthetic
              <br />• Perfect for dark mode interfaces
            </Typography>
          </Box>
        )}
        {selectedLayout === 'layout3b' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 3B: Massive Bin Hero with Gradient Cards
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Purple-blue gradient bin card with white text
              <br />• Each stats card has unique gradient background
              <br />• Vibrant, colorful, and eye-catching design
              <br />• Hover animations with scale and lift effects
              <br />• Modern, playful, and engaging presentation
            </Typography>
          </Box>
        )}
        {selectedLayout === 'layout3c' && (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#111827" gutterBottom>
              Layout 3C: Massive Bin Hero with Ultra Minimal
            </Typography>
            <Typography variant="body2" color="#6B7280">
              • Ultra-clean white design with subtle shadows
              <br />• Massive 400px tall silo with minimal variant
              <br />• Horizontal stats cards with plenty of whitespace
              <br />• Typography-focused with thin fonts
              <br />• Scandinavian minimalist aesthetic
            </Typography>
          </Box>
        )}
      </Box>

      {/* Render Selected Layout */}
      <Box sx={{ mt: 4 }}>
        {renderLayout()}
      </Box>
    </Box>
  );
};

export default DeviceLayoutShowcase;
