import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export const optimizationFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  
  client_h2flowrate: z.string().min(0).default('0'),
  client_h2flowhours: z.string().min(0).default('24'),
  projectLifetime: z.string().min(0).default('20'),
  contractCurrency: z.string().default('INR'),
  o2MarketSellClientOfftake: z.string().default('Yes'),
  o2MarketSellLimit: z.string().min(0).default('999999999'),
  excessProductionH2Merchant: z.string().default('Yes'),
  excessProductionH2MerchantLimit: z.string().min(0).default('999999999'),
  
  supplyPressureVsEL: z.string().default('High'),
  injectExcessPower: z.string().default('Yes'),
  drawPowerFromClient: z.string().default('Yes'),
  
  electrolyzerType: z.string().default('AEC'),
  electrolyzerstackConversion100Percent: z.string().min(0).default('4.6350'),
  electrolyzerstackConversionMinTurndown: z.string().min(0).default('3.744'),
  stackMinTurndownratio: z.string().min(0).default('0.2'),
  stackefficiencydegradation: z.string().min(0).default('0.00916667'),
  stackLifetime: z.string().min(0).default('82000'),
  TotalAuxRatedPowerDuringOperating: z.string().min(0).default('156'),
  TotalAuxRatedPowerOutsideOperating: z.string().min(0).default('42'),
  
  PvType: z.string().default('Mono'),
  PVOutputAnnualDegradation: z.string().min(0).default('0.005'),
  PvPlacement: z.string().default('GM'),
  
  BatteryroundtripEfficiency: z.string().min(0).default('0.85'),
  BatteryLife: z.string().min(0).default('11'),
  BatteryCapacityAnnualDegradation: z.string().min(0).default('0.0235'),
  
  PV_DC_size_LowerRange: z.string().min(0).default('6.8745'),
  PV_DC_size_HigherRange: z.string().min(0).default('6.8745'),
  inverter_ac_size_low: z.string().min(0).default('5.1967'),
  inverter_ac_size_high: z.string().min(0).default('5.1967'),
  wind_size_low: z.string().min(0).default('4.0664'),
  wind_size_high: z.string().min(0).default('4.0664'),
  
  power_evactuation_size_low: z.string().min(0).default('6'),
  power_evactuation_size_high: z.string().min(0).default('6'),
  ltoa_size_low: z.string().min(0).default('0'),
  ltoa_size_high: z.string().min(0).default('0'),
  
  battery_size_low: z.string().min(0).default('857.71'),
  battery_size_high: z.string().min(0).default('857.71'),
  
  electrolyser_size_low: z.string().min(0).default('3.2445'),
  electrolyser_size_high: z.string().min(0).default('3.2445'),
  
  low_bar_h2_storage_size_low: z.string().min(0).default('215'),
  low_bar_h2_storage_size_high: z.string().min(0).default('215'),
  high_bar_h2_storage_size_low: z.string().min(0).default('12000'),
  high_bar_h2_storage_size_high: z.string().min(0).default('12000'),
  h2_compressor_throughput_low: z.string().min(0).default('700'),
  h2_compressor_throughput_high: z.string().min(0).default('700'),
  
  o2_storage_low: z.string().min(0).default('106'),
  o2_storage_high: z.string().min(0).default('106'),
  o2_compressor_throughput_low: z.string().min(0).default('350'),
  o2_compressor_throughput_high: z.string().min(0).default('350'),
});

export type OptimizationFormValues = z.infer<typeof optimizationFormSchema>;
