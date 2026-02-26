import { Home, Landmark, CandlestickChart, FileText, CircleDollarSign, Bitcoin, LucideProps } from 'lucide-react';
import { ASSET_TYPES } from '@/lib/constants';

type AssetType = (typeof ASSET_TYPES)[number];

const iconMap: Record<AssetType, React.ElementType<LucideProps>> = {
  "Real Estate": Home,
  "Savings": Landmark,
  "Stocks": CandlestickChart,
  "Bonds": FileText,
  "Crypto": Bitcoin,
  "Other": CircleDollarSign,
};

interface AssetIconProps extends LucideProps {
  type: AssetType;
}

export const AssetIcon: React.FC<AssetIconProps> = ({ type, ...props }) => {
  const IconComponent = iconMap[type] || CircleDollarSign;
  return <IconComponent {...props} />;
};
