import React from 'react';
import {
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineSearchCircle,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineDocumentReport,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
  HiOutlineChat,
  HiOutlineChartPie,
  HiOutlineDatabase,
  HiOutlinePlusCircle,
  HiOutlineDownload,
  HiOutlineUpload,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineArrowRight,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineCash,
  HiOutlinePresentationChartLine,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineKey,
  HiOutlineFingerPrint,
  HiOutlineGlobe,
  HiOutlineFlag,
  HiOutlineTruck,
  HiOutlineSpeakerphone,
  HiOutlineShoppingBag
} from 'react-icons/hi';

import {
  HiSparkles,
  HiBuildingOffice2,
  HiRocketLaunch,
  HiChartBarSquare,
  HiBuildingStorefront,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBanknotes,
  HiMiniChartBar,
  HiMiniUserGroup,
  HiMiniBuildingOffice,
  HiCake,
  HiCube
} from 'react-icons/hi2';

// Icon component wrapper for consistent styling
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, color, className = '' }) => {
  const iconProps = {
    size,
    color,
    className: `icon ${className}`,
    style: { display: 'inline-flex', verticalAlign: 'middle' }
  };

  // Map icon names to components
  const iconMap: { [key: string]: React.ReactElement } = {
    // Navigation Icons
    'dashboard': <HiOutlineChartBar {...iconProps} />,
    'profile': <HiOutlineUser {...iconProps} />,
    'assessment': <HiOutlineClipboardList {...iconProps} />,
    'growth': <HiOutlineTrendingUp {...iconProps} />,
    'bootcamp': <HiOutlineAcademicCap {...iconProps} />,
    'xray': <HiOutlineSearchCircle {...iconProps} />,
    'transactions': <HiOutlineCurrencyDollar {...iconProps} />,
    'billing': <HiOutlineCreditCard {...iconProps} />,
    'settings': <HiOutlineCog {...iconProps} />,
    'logout': <HiOutlineLogout {...iconProps} />,

    // Header Icons
    'notification': <HiOutlineBell {...iconProps} />,
    'help': <HiOutlineQuestionMarkCircle {...iconProps} />,
    'menu': <HiOutlineMenu {...iconProps} />,
    'close': <HiOutlineX {...iconProps} />,
    'chevron-left': <HiOutlineChevronLeft {...iconProps} />,
    'chevron-right': <HiOutlineChevronRight {...iconProps} />,

    // Feature Icons
    'report': <HiOutlineDocumentReport {...iconProps} />,
    'security': <HiOutlineShieldCheck {...iconProps} />,
    'insights': <HiOutlineLightBulb {...iconProps} />,
    'chat': <HiOutlineChat {...iconProps} />,
    'analytics': <HiOutlineChartPie {...iconProps} />,
    'database': <HiOutlineDatabase {...iconProps} />,
    'sparkles': <HiSparkles {...iconProps} />,
    'rocket': <HiRocketLaunch {...iconProps} />,

    // Action Icons
    'add': <HiOutlinePlusCircle {...iconProps} />,
    'download': <HiOutlineDownload {...iconProps} />,
    'upload': <HiOutlineUpload {...iconProps} />,
    'refresh': <HiOutlineRefresh {...iconProps} />,
    'arrow-right': <HiOutlineArrowRight {...iconProps} />,
    'arrow-up': <HiOutlineArrowUp {...iconProps} />,
    'arrow-down': <HiOutlineArrowDown {...iconProps} />,
    'trending-up': <HiArrowTrendingUp {...iconProps} />,
    'trending-down': <HiArrowTrendingDown {...iconProps} />,

    // Status Icons
    'success': <HiOutlineCheckCircle {...iconProps} />,
    'error': <HiOutlineExclamationCircle {...iconProps} />,
    'info': <HiOutlineInformationCircle {...iconProps} />,

    // Business Icons
    'building': <HiOutlineOfficeBuilding {...iconProps} />,
    'building-2': <HiBuildingOffice2 {...iconProps} />,
    'storefront': <HiBuildingStorefront {...iconProps} />,
    'team': <HiOutlineUserGroup {...iconProps} />,
    'cash': <HiOutlineCash {...iconProps} />,
    'banknotes': <HiBanknotes {...iconProps} />,
    'presentation': <HiOutlinePresentationChartLine {...iconProps} />,
    'document': <HiOutlineDocumentText {...iconProps} />,
    'folder': <HiOutlineFolder {...iconProps} />,

    // Utility Icons
    'calendar': <HiOutlineCalendar {...iconProps} />,
    'clock': <HiOutlineClock {...iconProps} />,
    'location': <HiOutlineLocationMarker {...iconProps} />,
    'mail': <HiOutlineMail {...iconProps} />,
    'phone': <HiOutlinePhone {...iconProps} />,
    'eye': <HiOutlineEye {...iconProps} />,
    'eye-off': <HiOutlineEyeOff {...iconProps} />,
    'lock': <HiOutlineLockClosed {...iconProps} />,
    'unlock': <HiOutlineLockOpen {...iconProps} />,
    'key': <HiOutlineKey {...iconProps} />,
    'fingerprint': <HiOutlineFingerPrint {...iconProps} />,
    'globe': <HiOutlineGlobe {...iconProps} />,
    'flag': <HiOutlineFlag {...iconProps} />,

    // Chart Icons
    'chart-bar': <HiMiniChartBar {...iconProps} />,
    'chart-square': <HiChartBarSquare {...iconProps} />,

    // Transaction Hub Icons
    'car': <HiOutlineTruck {...iconProps} />,
    'food': <HiCake {...iconProps} />,
    'megaphone': <HiOutlineSpeakerphone {...iconProps} />,
    'package': <HiCube {...iconProps} />,
  };

  return iconMap[name] || <HiOutlineQuestionMarkCircle {...iconProps} />;
};

export default Icon;

// Export individual icon components for direct use
export {
  HiOutlineChartBar as ChartBarIcon,
  HiOutlineUser as UserIcon,
  HiOutlineClipboardList as ClipboardIcon,
  HiOutlineTrendingUp as TrendingUpIcon,
  HiOutlineAcademicCap as AcademicCapIcon,
  HiOutlineSearchCircle as SearchIcon,
  HiOutlineCurrencyDollar as CurrencyIcon,
  HiOutlineCreditCard as CreditCardIcon,
  HiOutlineCog as CogIcon,
  HiOutlineLogout as LogoutIcon,
  HiOutlineBell as BellIcon,
  HiOutlineQuestionMarkCircle as QuestionIcon,
  HiOutlineChevronLeft as ChevronLeftIcon,
  HiOutlineChevronRight as ChevronRightIcon,
  HiOutlineMenu as MenuIcon,
  HiOutlineX as CloseIcon,
  HiOutlineCheckCircle as CheckCircleIcon,
  HiOutlineExclamationCircle as ExclamationIcon,
  HiOutlineInformationCircle as InfoIcon,
  HiOutlinePlusCircle as PlusCircleIcon,
  HiOutlineArrowRight as ArrowRightIcon
};