export default function Illustration({ name, className = "" }) {
  const svgs = {
    onlineShopping: (
      <svg
        viewBox='0 0 800 600'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <rect x='150' y='100' width='500' height='400' rx='30' fill='#F0F4FF' />
        <rect x='200' y='160' width='180' height='200' rx='15' fill='#1a1a2e' />
        <circle cx='290' cy='240' r='35' fill='#FF9900' opacity='0.3' />
        <rect x='220' y='290' width='140' height='8' rx='4' fill='#FF9900' />
        <rect x='220' y='310' width='100' height='6' rx='3' fill='#565959' />
        <rect x='430' y='160' width='180' height='140' rx='15' fill='#0f3460' />
        <rect x='460' y='190' width='120' height='6' rx='3' fill='#FF9900' />
        <rect x='460' y='210' width='80' height='6' rx='3' fill='#565959' />
        <circle cx='520' cy='270' r='15' fill='#FF9900' opacity='0.4' />
        <rect x='200' y='420' width='400' height='40' rx='10' fill='#1a1a2e' />
        <rect x='330' y='480' width='140' height='8' rx='4' fill='#565959' />
      </svg>
    ),
    shopping: (
      <svg
        viewBox='0 0 800 600'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <circle cx='400' cy='300' r='200' fill='#FFF0F0' />
        <rect
          x='280'
          y='200'
          width='240'
          height='280'
          rx='20'
          fill='white'
          stroke='#FF6B6B'
          strokeWidth='3'
        />
        <path
          d='M310 280 L400 200 L490 280 L460 280 L460 420 L340 420 L340 280 Z'
          fill='#FF6B6B'
          opacity='0.2'
          stroke='#FF6B6B'
          strokeWidth='2'
        />
        <circle cx='360' cy='310' r='12' fill='#FF6B6B' />
        <circle cx='440' cy='310' r='12' fill='#FF6B6B' />
        <rect x='310' y='440' width='180' height='25' rx='12' fill='#1a1a2e' />
        <circle cx='550' cy='180' r='30' fill='#FF6B6B' opacity='0.1' />
        <circle cx='250' cy='450' r='20' fill='#FF6B6B' opacity='0.1' />
      </svg>
    ),
    mobileApp: (
      <svg
        viewBox='0 0 800 600'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <circle cx='400' cy='300' r='180' fill='#F0FAFF' />
        <rect x='320' y='150' width='160' height='300' rx='25' fill='#1a1a2e' />
        <rect x='340' y='180' width='120' height='160' rx='10' fill='#0a4d68' />
        <circle cx='400' cy='260' r='40' fill='#00D2FF' opacity='0.3' />
        <rect x='350' y='360' width='100' height='8' rx='4' fill='#00D2FF' />
        <rect x='350' y='380' width='70' height='6' rx='3' fill='#565959' />
        <circle cx='400' cy='480' r='8' fill='#00D2FF' />
        <path
          d='M280 250 Q260 300 280 350'
          stroke='#00D2FF'
          strokeWidth='6'
          strokeLinecap='round'
          opacity='0.3'
        />
        <path
          d='M520 250 Q540 300 520 350'
          stroke='#00D2FF'
          strokeWidth='6'
          strokeLinecap='round'
          opacity='0.3'
        />
      </svg>
    ),
    delivery: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <rect x='30' y='80' width='140' height='80' rx='12' fill='#E8F4FD' />
        <rect x='40' y='90' width='80' height='40' rx='8' fill='#3B82F6' />
        <rect x='130' y='90' width='30' height='40' rx='6' fill='#1D4ED8' />
        <circle cx='60' cy='170' r='12' fill='#1a1a2e' />
        <circle cx='140' cy='170' r='12' fill='#1a1a2e' />
        <path
          d='M20 120 L30 80 L70 80 L70 120'
          stroke='#3B82F6'
          strokeWidth='3'
          fill='none'
        />
      </svg>
    ),
    security: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <rect x='50' y='40' width='100' height='130' rx='15' fill='#ECFDF5' />
        <path
          d='M100 50 L130 65 L130 105 C130 130 100 155 100 155 C100 155 70 130 70 105 L70 65 Z'
          fill='#10B981'
          opacity='0.2'
          stroke='#10B981'
          strokeWidth='3'
        />
        <path
          d='M88 105 L97 115 L115 90'
          stroke='#10B981'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    success: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <circle cx='100' cy='100' r='70' fill='#F3E8FF' />
        <path
          d='M60 100 L88 128 L140 75'
          stroke='#9333EA'
          strokeWidth='6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    team: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <circle cx='100' cy='100' r='70' fill='#FFF7ED' />
        <circle cx='100' cy='75' r='22' fill='#F97316' />
        <ellipse
          cx='100'
          cy='135'
          rx='40'
          ry='25'
          fill='#F97316'
          opacity='0.5'
        />
        <circle cx='70' cy='80' r='14' fill='#EA580C' />
        <circle cx='130' cy='80' r='14' fill='#EA580C' />
      </svg>
    ),
    celebration: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <circle cx='100' cy='100' r='60' fill='#FFF1F2' />
        <text x='100' y='115' textAnchor='middle' fontSize='50'>
          🎉
        </text>
      </svg>
    ),
    newsletter: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <rect x='30' y='50' width='140' height='110' rx='15' fill='#E0E7FF' />
        <rect x='50' y='70' width='100' height='8' rx='4' fill='#4338CA' />
        <rect x='50' y='90' width='80' height='6' rx='3' fill='#6366F1' />
        <rect x='50' y='105' width='60' height='6' rx='3' fill='#818CF8' />
        <path d='M160 50 L180 30 L180 50 Z' fill='#4338CA' opacity='0.3' />
      </svg>
    ),
    emptyCart: (
      <svg
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <rect x='50' y='60' width='100' height='100' rx='15' fill='#F3F4F6' />
        <path
          d='M60 80 L90 55 L140 80'
          stroke='#9CA3AF'
          strokeWidth='4'
          fill='none'
          strokeLinecap='round'
        />
        <line
          x1='70'
          y1='100'
          x2='130'
          y2='100'
          stroke='#D1D5DB'
          strokeWidth='3'
          strokeLinecap='round'
        />
        <line
          x1='70'
          y1='115'
          x2='110'
          y2='115'
          stroke='#D1D5DB'
          strokeWidth='3'
          strokeLinecap='round'
        />
      </svg>
    ),
  };

  return svgs[name] || svgs.onlineShopping;
}
